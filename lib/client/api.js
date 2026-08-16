/**
 * Browser-side API client for the /api/dsh-trilium route family. The only
 * data access path the settings card and sidebar panel use — plain fetch,
 * same origin (loopback).
 */
import { TRILIUM_API, } from "../protocol.js";
/** Error carrying the route's JSON error message. */
export class TriliumApiError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TriliumApiError';
    }
}
/** Parse a JSON response or throw a TriliumApiError. */
async function readJson(response) {
    let body;
    try {
        body = await response.json();
    }
    catch {
        throw new TriliumApiError('HTTP ' + response.status + ': invalid JSON response');
    }
    if (!response.ok) {
        const message = typeof body === 'object' && body !== null && typeof body.error === 'string'
            ? body.error
            : 'HTTP ' + response.status;
        throw new TriliumApiError(message);
    }
    return body;
}
/** Query-string helper. */
function query(params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '')
            search.set(key, String(value));
    }
    const text = search.toString();
    return text === '' ? '' : '?' + text;
}
/** The browser half's data entry point. */
export class TriliumApi {
    // ------------------------------------------------------------ config
    async getConfig() {
        const response = await fetch(TRILIUM_API.config);
        const body = await readJson(response);
        return body.config;
    }
    async putConfig(patch) {
        const response = await fetch(TRILIUM_API.config, {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(patch),
        });
        const body = await readJson(response);
        return body.config;
    }
    /** Test a candidate connection (unsaved values allowed). */
    async test(baseUrl, token) {
        const response = await fetch(TRILIUM_API.test, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ baseUrl, token }),
        });
        const body = await readJson(response);
        return body.result;
    }
    // ------------------------------------------------------------- notes
    async search(search, ancestorNoteId) {
        const response = await fetch(TRILIUM_API.search + query({ search, ancestorNoteId }));
        const body = await readJson(response);
        return body.results;
    }
    async getNote(noteId, withContent = false) {
        const response = await fetch(TRILIUM_API.note + query({ noteId, content: withContent ? 1 : undefined }));
        return readJson(response);
    }
    async getChildren(noteId = 'root') {
        const response = await fetch(TRILIUM_API.children + query({ noteId }));
        const body = await readJson(response);
        return body.children;
    }
}
