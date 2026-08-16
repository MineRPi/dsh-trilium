/**
 * Host HTTP routes: the /api/dsh-trilium family the browser half calls.
 * Loopback-only (same trust model as dsh-ssh) — the config endpoint handles
 * the ETAPI token, so it must never be reachable from another origin.
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
import type { TriliumEtapi } from './etapi.ts';
import { type TriliumConfigView } from './protocol.ts';
/** Route family dependencies. */
export interface TriliumRoutesDeps {
    etapi: TriliumEtapi;
}
/**
 * Build every /api/dsh-trilium route (exact paths).
 * @param deps - the ETAPI client (config read through it stays live).
 * @returns the routes array.
 */
export declare function makeRoutes(deps: TriliumRoutesDeps): WebRoute[];
export type { TriliumConfigView };
