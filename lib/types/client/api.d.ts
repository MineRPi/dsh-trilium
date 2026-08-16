/**
 * Browser-side API client for the /api/dsh-trilium route family. The only
 * data access path the settings card and sidebar panel use — plain fetch,
 * same origin (loopback).
 */
import { type TriliumChildSummary, type TriliumConfigPatch, type TriliumConfigView, type TriliumNote, type TriliumSearchResult, type TriliumTestResult } from '../protocol.ts';
/** Error carrying the route's JSON error message. */
export declare class TriliumApiError extends Error {
    constructor(message: string);
}
/** The browser half's data entry point. */
export declare class TriliumApi {
    getConfig(): Promise<TriliumConfigView>;
    putConfig(patch: TriliumConfigPatch): Promise<TriliumConfigView>;
    /** Test a candidate connection (unsaved values allowed). */
    test(baseUrl: string, token: string): Promise<TriliumTestResult>;
    search(search: string, ancestorNoteId?: string): Promise<TriliumSearchResult[]>;
    getNote(noteId: string, withContent?: boolean): Promise<{
        note: TriliumNote;
        content?: string;
    }>;
    getChildren(noteId?: string): Promise<TriliumChildSummary[]>;
}
