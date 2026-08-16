/**
 * Agent tools (extended half): clone, attachments, calendar notes, backup/
 * import, and revisions — the ETAPI surface beyond the core note/memory set.
 */
import type { TriliumEtapi } from './etapi.ts';
/** Clone a note to another directory (branch), or remove a clone. */
export declare function triliumCloneTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Manage note attachments (images/files). */
export declare function triliumAttachmentTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Calendar notes (day/week/month/year/inbox). */
export declare function triliumCalendarTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Create a database backup. */
export declare function triliumBackupTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Import a ZIP archive into a note. */
export declare function triliumImportTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** List/read note revisions. */
export declare function triliumRevisionsTool(etapi: TriliumEtapi): import("@deepseek-ai/dsh-tools").ToolDefinition;
