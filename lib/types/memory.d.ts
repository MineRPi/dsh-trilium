/**
 * Memory integration: what the plugin tells every agent.
 *
 * Static part — the user's durable rules (written rules, weekly-report style,
 * writing-style profile), distilled from the Trilium memory notes the user
 * maintains (Agent笔记/写入规则, 周报撰写规范, 写作风格与目录习惯档案).
 *
 * Dynamic part — the live index of the memory directory (Agent笔记), fetched
 * through ETAPI and cached briefly so session starts stay cheap.
 */
import type { TriliumEtapi } from './etapi.ts';
import type { TriliumConfig } from './protocol.ts';
/** Static guidance: announced to every agent (the plugin's memory contract). */
export declare const TRILIUM_GUIDANCE: string;
/**
 * Build the memory-directory index text (title + type + children count) from
 * ETAPI. Cached 5 minutes; failures are cached briefly too so a flaky server
 * does not hammer the network on every session start.
 */
export declare function buildMemoryIndex(etapi: TriliumEtapi, config: TriliumConfig): Promise<string>;
/** Invalidate the index cache (e.g. after a remember write). */
export declare function invalidateMemoryIndex(): void;
/** Synchronous cache read ('' when not ready or failed). */
export declare function readCachedIndex(): string;
