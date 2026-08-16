/**
 * Host config store: one JSON file (~/.dsh/dsh-trilium.json) holding the
 * ETAPI connection config, written atomically (tmp + rename) with mode 0600.
 * The token is a secret: the browser only ever sees tokenSet; an empty token
 * in a patch keeps the stored value.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { DEFAULT_CONFIG, } from "./protocol.js";
/** Store file format version. */
const FORMAT_VERSION = 1;
/** Store file location: <home>/.dsh/dsh-trilium.json. */
export function storePath() {
    return join(homedir(), '.dsh', 'dsh-trilium.json');
}
/** Merge defaults over stored values (unknown keys are dropped). */
function normalize(partial) {
    const p = partial ?? {};
    const pick = (key, fallback) => {
        const value = p[key];
        return value === undefined ? fallback : value;
    };
    return {
        baseUrl: pick('baseUrl', DEFAULT_CONFIG.baseUrl),
        token: pick('token', ''),
        memoryNoteId: pick('memoryNoteId', DEFAULT_CONFIG.memoryNoteId),
        timeoutMs: pick('timeoutMs', DEFAULT_CONFIG.timeoutMs),
        autoInject: pick('autoInject', DEFAULT_CONFIG.autoInject),
        deleteConfirm: pick('deleteConfirm', DEFAULT_CONFIG.deleteConfirm),
        announceToAgent: pick('announceToAgent', DEFAULT_CONFIG.announceToAgent),
        tokenSet: false, // recomputed below
    };
}
/** Read the stored config (defaults when absent or corrupt). */
export function readConfig() {
    const path = storePath();
    try {
        if (!existsSync(path))
            return { ...normalize(undefined), tokenSet: false };
        const parsed = JSON.parse(readFileSync(path, 'utf8'));
        if (typeof parsed !== 'object' || parsed === null)
            return { ...normalize(undefined), tokenSet: false };
        const file = parsed;
        const config = normalize(file.config);
        return { ...config, tokenSet: config.token !== '' };
    }
    catch {
        // Corrupt store: fall back to defaults rather than failing the plugin.
        return { ...normalize(undefined), tokenSet: false };
    }
}
/** Atomically persist the config (tmp + rename, mode 0600). */
export function writeConfig(config) {
    const path = storePath();
    mkdirSync(dirname(path), { recursive: true });
    const file = { version: FORMAT_VERSION, config: { ...config } };
    const tmp = path + '.tmp';
    writeFileSync(tmp, JSON.stringify(file, null, 2) + '\n', { mode: 0o600 });
    renameSync(tmp, path);
    try {
        chmodSync(path, 0o600);
    }
    catch {
        // Best effort — the file already carries 0600 from creation.
    }
}
/** Apply a browser patch (empty token keeps the stored one). */
export function patchConfig(current, patch) {
    const next = { ...current };
    if (patch.baseUrl !== undefined)
        next.baseUrl = patch.baseUrl.trim();
    if (patch.token !== undefined && patch.token !== '')
        next.token = patch.token.trim();
    if (patch.memoryNoteId !== undefined)
        next.memoryNoteId = patch.memoryNoteId.trim();
    if (patch.timeoutMs !== undefined && Number.isFinite(patch.timeoutMs) && patch.timeoutMs > 0) {
        next.timeoutMs = Math.floor(patch.timeoutMs);
    }
    if (patch.autoInject !== undefined)
        next.autoInject = patch.autoInject;
    if (patch.deleteConfirm !== undefined)
        next.deleteConfirm = patch.deleteConfirm;
    if (patch.announceToAgent !== undefined)
        next.announceToAgent = patch.announceToAgent;
    return next;
}
/** Browser-safe projection (no token value). */
export function toView(config) {
    return {
        baseUrl: config.baseUrl,
        memoryNoteId: config.memoryNoteId,
        timeoutMs: config.timeoutMs,
        autoInject: config.autoInject,
        deleteConfirm: config.deleteConfirm,
        announceToAgent: config.announceToAgent,
        tokenSet: config.token !== '',
    };
}
/** Validate a config patch; returns an error message or undefined. */
export function validatePatch(patch) {
    if (typeof patch !== 'object' || patch === null)
        return 'body must be a JSON object';
    const p = patch;
    if (p.baseUrl !== undefined && (typeof p.baseUrl !== 'string' || p.baseUrl.trim() === '')) {
        return 'baseUrl must be a non-empty string';
    }
    if (p.token !== undefined && typeof p.token !== 'string')
        return 'token must be a string';
    if (p.memoryNoteId !== undefined && (typeof p.memoryNoteId !== 'string' || p.memoryNoteId.trim() === '')) {
        return 'memoryNoteId must be a non-empty string';
    }
    if (p.timeoutMs !== undefined && (typeof p.timeoutMs !== 'number' || !Number.isFinite(p.timeoutMs) || p.timeoutMs < 1 || p.timeoutMs > 120000)) {
        return 'timeoutMs must be an integer in 1..120000';
    }
    for (const key of ['autoInject', 'deleteConfirm', 'announceToAgent']) {
        if (p[key] !== undefined && typeof p[key] !== 'boolean')
            return key + ' must be a boolean';
    }
    return undefined;
}
