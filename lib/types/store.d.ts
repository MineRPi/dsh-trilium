/**
 * Host config store: one JSON file (~/.dsh/dsh-trilium.json) holding the
 * ETAPI connection config, written atomically (tmp + rename) with mode 0600.
 * The token is a secret: the browser only ever sees tokenSet; an empty token
 * in a patch keeps the stored value.
 */
import { type TriliumConfig, type TriliumConfigPatch, type TriliumConfigView } from './protocol.ts';
/** Store file location: <home>/.dsh/dsh-trilium.json. */
export declare function storePath(): string;
/** Read the stored config (defaults when absent or corrupt). */
export declare function readConfig(): TriliumConfig;
/** Atomically persist the config (tmp + rename, mode 0600). */
export declare function writeConfig(config: TriliumConfig): void;
/** Apply a browser patch (empty token keeps the stored one). */
export declare function patchConfig(current: TriliumConfig, patch: TriliumConfigPatch): TriliumConfig;
/** Browser-safe projection (no token value). */
export declare function toView(config: TriliumConfig): TriliumConfigView;
/** Validate a config patch; returns an error message or undefined. */
export declare function validatePatch(patch: unknown): string | undefined;
