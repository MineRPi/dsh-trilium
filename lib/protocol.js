/**
 * Wire contract between the host half (routes.ts / tools.ts) and the browser
 * half (client/api.ts). Pure types + path constants only — imported by both
 * halves, bundled into each, no runtime identity to share.
 */
/** Route paths the client calls (shared literals). */
export const TRILIUM_API_BASE = '/api/dsh-trilium';
export const TRILIUM_API = {
    config: TRILIUM_API_BASE + '/config',
    test: TRILIUM_API_BASE + '/test',
    search: TRILIUM_API_BASE + '/search',
    note: TRILIUM_API_BASE + '/note',
    children: TRILIUM_API_BASE + '/children',
};
/** Default config values (single source for host defaults). */
export const DEFAULT_CONFIG = {
    baseUrl: '',
    memoryNoteId: '',
    timeoutMs: 15000,
    autoInject: true,
    deleteConfirm: true,
    announceToAgent: true,
};
