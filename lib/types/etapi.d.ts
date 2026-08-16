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
import type { CreateAttachmentPayload, CreateBranchPayload, CalendarNoteType, TriliumAppInfo, TriliumAttachment, TriliumAttribute, TriliumBranch, TriliumChildSummary, TriliumConfig, TriliumNote, TriliumRecentChange, TriliumRevision, TriliumSearchResult } from './protocol.ts';
/** Error carrying ETAPI's {status, code, message} shape. */
export declare class TriliumApiError extends Error {
    readonly status: number | undefined;
    readonly code: string | undefined;
    constructor(message: string, status?: number, code?: string);
}
/** Search parameter bag (GET /notes). */
export interface SearchParams {
    search: string;
    fastSearch?: boolean;
    includeArchivedNotes?: boolean;
    ancestorNoteId?: string;
    ancestorDepth?: string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    debug?: boolean;
}
/** Create-note payload (POST /create-note). */
export interface CreateNotePayload {
    parentNoteId: string;
    title: string;
    type?: string;
    mime?: string;
    content?: string;
    notePosition?: number;
    prefix?: string;
    isExpanded?: boolean;
    noteId?: string;
    branchId?: string;
}
/** Attribute create payload (POST /attributes). */
export interface CreateAttributePayload {
    noteId: string;
    type: 'label' | 'relation';
    name: string;
    value?: string;
    position?: number;
    isInheritable?: boolean;
}
/** The ETAPI client (one instance per plugin load, stateless requests). */
export declare class TriliumEtapi {
    private readonly getConfig;
    constructor(getConfig: () => TriliumConfig);
    private base;
    private token;
    private timeoutMs;
    /** One fetch with the configured timeout; aborts into a TriliumApiError. */
    private fetchTimed;
    /** Core request: JSON in, JSON out. */
    private request;
    appInfo(): Promise<TriliumAppInfo>;
    searchNotes(params: SearchParams): Promise<TriliumSearchResult[]>;
    getNote(noteId: string): Promise<TriliumNote>;
    /** Note content as raw text (ETAPI returns text/plain, not JSON). */
    getNoteContent(noteId: string): Promise<string>;
    createNote(payload: CreateNotePayload): Promise<{
        note: TriliumNote;
        branch: TriliumBranch;
    }>;
    /** PATCH metadata (title etc.). Never sends content — ETAPI rejects it. */
    patchNote(noteId: string, patch: Partial<Pick<TriliumNote, 'title' | 'type' | 'mime' | 'isProtected'>>): Promise<TriliumNote>;
    /** Replace note content (text/plain raw body — the ETAPI quirk). */
    putNoteContent(noteId: string, content: string): Promise<void>;
    deleteNote(noteId: string): Promise<void>;
    undeleteNote(noteId: string): Promise<{
        success: boolean;
    }>;
    getHistory(ancestorNoteId?: string): Promise<TriliumRecentChange[]>;
    getNoteRevisions(noteId: string): Promise<TriliumRevision[]>;
    getRevisionContent(revisionId: string): Promise<string>;
    createBranch(payload: CreateBranchPayload): Promise<TriliumBranch>;
    getBranch(branchId: string): Promise<TriliumBranch>;
    deleteBranch(branchId: string): Promise<void>;
    getAttribute(attributeId: string): Promise<TriliumAttribute>;
    createAttribute(payload: CreateAttributePayload): Promise<TriliumAttribute>;
    patchAttribute(attributeId: string, patch: Partial<Pick<TriliumAttribute, 'name' | 'value' | 'position' | 'isInheritable'>>): Promise<TriliumAttribute>;
    deleteAttribute(attributeId: string): Promise<void>;
    getNoteAttachments(noteId: string): Promise<TriliumAttachment[]>;
    getAttachment(attachmentId: string): Promise<TriliumAttachment>;
    createAttachment(payload: CreateAttachmentPayload): Promise<TriliumAttachment>;
    deleteAttachment(attachmentId: string): Promise<void>;
    /** Attachment content (binary; returns the bytes). */
    getAttachmentContent(attachmentId: string): Promise<{
        buffer: ArrayBuffer;
        contentType: string;
    }>;
    /** Day/week/month/year note (auto-created by Trilium). */
    getCalendarNote(type: Exclude<CalendarNoteType, 'inbox'>, date: string): Promise<TriliumNote>;
    getInboxNote(date: string): Promise<TriliumNote>;
    createBackup(name: string): Promise<void>;
    /** Import a ZIP file from disk into a note (multipart upload). */
    importZip(noteId: string, zipPath: string): Promise<{
        note: TriliumNote;
        branch: TriliumBranch;
    }>;
    /** Export a subtree as a ZIP archive (binary), returns the bytes. */
    exportNote(noteId: string, format: 'html' | 'markdown' | 'share'): Promise<{
        buffer: ArrayBuffer;
        contentType: string;
    }>;
    /** Child summaries for the tree browser. */
    listChildren(noteId: string): Promise<TriliumChildSummary[]>;
}
