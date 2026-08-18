/**
 * dsh-trilium — host half. Mounts the ETAPI client, the /api/dsh-trilium
 * route family (config store + browser helpers), the agent tools
 * (trilium_*), the system-prompt announcement (plugin capabilities + memory
 * rules) and the live memory-index section (auto-injected per session when
 * enabled). The browser half (./client) renders the standalone settings
 * page (设置 → Trilium 记忆库).
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Stable cordis plugin name. */
export declare const name = "trilium";
/** Services required before the Trilium surfaces can mount. */
export declare const inject: string[];
/** Settings namespace the browser settings card is keyed by (rc7 keyed slot). */
export declare const TRILIUM_SETTINGS_NAMESPACE: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/**
 * Plugin config (cordis.yml). The ETAPI connection (baseUrl/token/memoryNoteId
 * /timeoutMs) and behavior switches (autoInject/deleteConfirm) live in
 * ~/.dsh/dsh-trilium.json (0600) and are edited on the settings page; only
 * these two cordis-level switches are configurable here.
 */
export interface Config {
    enabled?: boolean;
    announceToAgent?: boolean;
}
export declare const Config: z<Config>;
export declare function apply(ctx: Context, config?: Config): void;
