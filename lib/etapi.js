/**
 * ETAPI client: the full Trilium REST surface the tools and routes need.
 * Thin fetch wrapper — every call carries the Authorization token, obeys the
 * configured timeout, and normalizes errors into TriliumApiError.
 *
 * Known ETAPI quirks (encoded here so tools stay simple):
 *  - PATCH /notes/:id rejects a content field (PROPERTY_NOT_ALLOWED);
 *    content goes through PUT /notes/:id/content with text/plain body.
 *  - GET /notes/:id/content returns raw text (not JSON).
 *  - Attachment uploads take base64 in the JSON body; downloads are binary.
 */
import { readFileSync } from 'node:fs';
/** Error carrying ETAPI's {status, code, message} shape. */
export class TriliumApiError extends Error {
    status;
    code;
    constructor(message, status, code) {
        super(message);
        this.name = 'TriliumApiError';
        this.status = status;
        this.code = code;
    }
}
/** The ETAPI client (one instance per plugin load, stateless requests). */
export class TriliumEtapi {
    getConfig;
    constructor(getConfig) {
        this.getConfig = getConfig;
    }
    base() {
        return this.getConfig().baseUrl.replace(/\/$/, '');
    }
    token() {
        return this.getConfig().token;
    }
    timeoutMs() {
        return this.getConfig().timeoutMs;
    }
    /** One fetch with the configured timeout; aborts into a TriliumApiError. */
    async fetchTimed(url, init, timeoutMs = this.timeoutMs()) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { ...init, signal: controller.signal });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new TriliumApiError('ETAPI request timed out after ' + timeoutMs + 'ms');
            }
            throw new TriliumApiError(error instanceof Error ? error.message : String(error));
        }
        finally {
            clearTimeout(timer);
        }
    }
    /** Core request: JSON in, JSON out. */
    async request(method, path, body) {
        const headers = { Authorization: this.token() };
        let payload;
        if (body !== undefined) {
            headers['content-type'] = 'application/json';
            payload = JSON.stringify(body);
        }
        const response = await this.fetchTimed(this.base() + path, { method, headers, body: payload });
        if (response.status === 204)
            return undefined;
        const text = await response.text();
        if (!response.ok) {
            let status;
            let code;
            let message = 'HTTP ' + response.status;
            try {
                const parsed = JSON.parse(text);
                if (typeof parsed === 'object' && parsed !== null) {
                    const p = parsed;
                    if (typeof p.message === 'string')
                        message = p.message;
                    if (typeof p.status === 'number')
                        status = p.status;
                    if (typeof p.code === 'string')
                        code = p.code;
                }
            }
            catch {
                // Non-JSON error body.
            }
            throw new TriliumApiError(message, status, code);
        }
        if (text === '')
            return undefined;
        return JSON.parse(text);
    }
    // ------------------------------------------------------------ app
    appInfo() {
        return this.request('GET', '/app-info');
    }
    // --------------------------------------------------------- search
    async searchNotes(params) {
        const query = new URLSearchParams();
        query.set('search', params.search);
        if (params.fastSearch !== undefined)
            query.set('fastSearch', String(params.fastSearch));
        if (params.includeArchivedNotes !== undefined)
            query.set('includeArchivedNotes', String(params.includeArchivedNotes));
        if (params.ancestorNoteId !== undefined)
            query.set('ancestorNoteId', params.ancestorNoteId);
        if (params.ancestorDepth !== undefined)
            query.set('ancestorDepth', params.ancestorDepth);
        if (params.orderBy !== undefined)
            query.set('orderBy', params.orderBy);
        if (params.orderDirection !== undefined)
            query.set('orderDirection', params.orderDirection);
        if (params.limit !== undefined)
            query.set('limit', String(params.limit));
        if (params.debug !== undefined)
            query.set('debug', String(params.debug));
        const body = await this.request('GET', '/notes?' + query.toString());
        return body.results;
    }
    // ----------------------------------------------------------- notes
    getNote(noteId) {
        return this.request('GET', '/notes/' + encodeURIComponent(noteId));
    }
    /** Note content as raw text (ETAPI returns text/plain, not JSON). */
    async getNoteContent(noteId) {
        const response = await this.fetchTimed(this.base() + '/notes/' + encodeURIComponent(noteId) + '/content', {
            headers: { Authorization: this.token() },
        });
        if (!response.ok)
            throw new TriliumApiError('ETAPI HTTP ' + response.status, response.status);
        return await response.text();
    }
    createNote(payload) {
        return this.request('POST', '/create-note', payload);
    }
    /** PATCH metadata (title etc.). Never sends content — ETAPI rejects it. */
    patchNote(noteId, patch) {
        return this.request('PATCH', '/notes/' + encodeURIComponent(noteId), patch);
    }
    /** Replace note content (text/plain raw body — the ETAPI quirk). */
    async putNoteContent(noteId, content) {
        const response = await this.fetchTimed(this.base() + '/notes/' + encodeURIComponent(noteId) + '/content', {
            method: 'PUT',
            headers: { Authorization: this.token(), 'content-type': 'text/plain' },
            body: content,
        });
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new TriliumApiError('ETAPI HTTP ' + response.status + ': ' + text.slice(0, 200), response.status);
        }
    }
    deleteNote(noteId) {
        return this.request('DELETE', '/notes/' + encodeURIComponent(noteId));
    }
    undeleteNote(noteId) {
        return this.request('POST', '/notes/' + encodeURIComponent(noteId) + '/undelete');
    }
    getHistory(ancestorNoteId) {
        const query = ancestorNoteId === undefined ? '' : '?ancestorNoteId=' + encodeURIComponent(ancestorNoteId);
        return this.request('GET', '/notes/history' + query);
    }
    // ------------------------------------------------------- revisions
    getNoteRevisions(noteId) {
        return this.request('GET', '/notes/' + encodeURIComponent(noteId) + '/revisions');
    }
    async getRevisionContent(revisionId) {
        const response = await this.fetchTimed(this.base() + '/revisions/' + encodeURIComponent(revisionId) + '/content', {
            headers: { Authorization: this.token() },
        });
        if (!response.ok)
            throw new TriliumApiError('ETAPI HTTP ' + response.status, response.status);
        return await response.text();
    }
    // -------------------------------------------------------- branches
    createBranch(payload) {
        return this.request('POST', '/branches', payload);
    }
    getBranch(branchId) {
        return this.request('GET', '/branches/' + encodeURIComponent(branchId));
    }
    deleteBranch(branchId) {
        return this.request('DELETE', '/branches/' + encodeURIComponent(branchId));
    }
    // ------------------------------------------------------ attributes
    getAttribute(attributeId) {
        return this.request('GET', '/attributes/' + encodeURIComponent(attributeId));
    }
    createAttribute(payload) {
        return this.request('POST', '/attributes', payload);
    }
    patchAttribute(attributeId, patch) {
        return this.request('PATCH', '/attributes/' + encodeURIComponent(attributeId), patch);
    }
    deleteAttribute(attributeId) {
        return this.request('DELETE', '/attributes/' + encodeURIComponent(attributeId));
    }
    // ------------------------------------------------------ attachments
    getNoteAttachments(noteId) {
        return this.request('GET', '/notes/' + encodeURIComponent(noteId) + '/attachments');
    }
    getAttachment(attachmentId) {
        return this.request('GET', '/attachments/' + encodeURIComponent(attachmentId));
    }
    createAttachment(payload) {
        return this.request('POST', '/attachments', payload);
    }
    deleteAttachment(attachmentId) {
        return this.request('DELETE', '/attachments/' + encodeURIComponent(attachmentId));
    }
    /** Attachment content (binary; returns the bytes). */
    async getAttachmentContent(attachmentId) {
        const response = await this.fetchTimed(this.base() + '/attachments/' + encodeURIComponent(attachmentId) + '/content', {
            headers: { Authorization: this.token() },
        });
        if (!response.ok)
            throw new TriliumApiError('ETAPI HTTP ' + response.status, response.status);
        return { buffer: await response.arrayBuffer(), contentType: response.headers.get('content-type') ?? 'application/octet-stream' };
    }
    // --------------------------------------------------------- calendar
    /** Day/week/month/year note (auto-created by Trilium). */
    getCalendarNote(type, date) {
        const path = type === 'day' ? '/calendar/days/' : type === 'week' ? '/calendar/weeks/' : type === 'month' ? '/calendar/months/' : '/calendar/years/';
        return this.request('GET', path + encodeURIComponent(date));
    }
    getInboxNote(date) {
        return this.request('GET', '/inbox/' + encodeURIComponent(date));
    }
    // ---------------------------------------------------------- backup
    createBackup(name) {
        return this.request('PUT', '/backup/' + encodeURIComponent(name));
    }
    // ----------------------------------------------------------- import
    /** Import a ZIP file from disk into a note (multipart upload). */
    async importZip(noteId, zipPath) {
        const bytes = readFileSync(zipPath);
        const boundary = '----dsh-trilium-' + Date.now().toString(36);
        const head = Buffer.from('--' + boundary + '\r\n' +
            'Content-Disposition: form-data; name="export"; filename="export.zip"\r\n' +
            'Content-Type: application/zip\r\n\r\n');
        const tail = Buffer.from('\r\n--' + boundary + '--\r\n');
        const body = Buffer.concat([head, bytes, tail]);
        const response = await this.fetchTimed(this.base() + '/notes/' + encodeURIComponent(noteId) + '/import', {
            method: 'POST',
            headers: { Authorization: this.token(), 'content-type': 'multipart/form-data; boundary=' + boundary },
            body: body,
        }, Math.max(this.timeoutMs(), 120000));
        if (!response.ok)
            throw new TriliumApiError('ETAPI HTTP ' + response.status, response.status);
        return await response.json();
    }
    // ---------------------------------------------------------- export
    /** Export a subtree as a ZIP archive (binary), returns the bytes. */
    async exportNote(noteId, format) {
        const response = await this.fetchTimed(this.base() + '/notes/' + encodeURIComponent(noteId) + '/export?format=' + format, {
            headers: { Authorization: this.token() },
        }, Math.max(this.timeoutMs(), 60000));
        if (!response.ok)
            throw new TriliumApiError('ETAPI HTTP ' + response.status, response.status);
        return { buffer: await response.arrayBuffer(), contentType: response.headers.get('content-type') ?? 'application/zip' };
    }
    // ---------------------------------------------------------- helpers
    /** Child summaries for the tree browser. */
    async listChildren(noteId) {
        const note = await this.getNote(noteId);
        const summaries = [];
        for (const childId of note.childNoteIds) {
            try {
                const child = await this.getNote(childId);
                summaries.push({
                    noteId: child.noteId,
                    title: child.title,
                    type: child.type,
                    hasChildren: child.childNoteIds.length > 0,
                    isProtected: child.isProtected,
                });
            }
            catch {
                // A child that vanished mid-browse is skipped, not fatal.
            }
        }
        return summaries;
    }
}
