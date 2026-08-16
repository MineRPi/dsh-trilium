/**
 * Agent tools (notes/management half): the DSH-native counterpart of the
 * ETAPI surface. Every tool talks to the same ETAPI client the routes use,
 * so a server configured in the GUI is immediately operable by any agent.
 *
 * Memory tools (trilium_remember / trilium_recall / trilium_weekly_report)
 * live in tools-memory.ts.
 */
import type { TriliumEtapi } from './etapi.ts';
import type { TriliumConfig } from './protocol.ts';
/** App info / connection test. */
export declare function triliumAppInfoTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Full-text search. */
export declare function triliumSearchTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Get one note (metadata + optional content + attributes). */
export declare function triliumGetNoteTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** List children (tree browsing). */
export declare function triliumListChildrenTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Create a note. */
export declare function triliumCreateNoteTool(etapi: TriliumEtapi, getConfig: () => TriliumConfig): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Update title/content/metadata. */
export declare function triliumUpdateNoteTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Delete a note (confirm-gated, soft delete into the trash). */
export declare function triliumDeleteNoteTool(etapi: TriliumEtapi, getConfig: () => TriliumConfig): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Undelete a note. */
export declare function triliumUndeleteNoteTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Attribute management. */
export declare function triliumAttributeTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Export a subtree as ZIP (via routes, saved to /tmp on the host). */
export declare function triliumExportTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Recent changes. */
export declare function triliumHistoryTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
