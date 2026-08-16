/**
 * Agent tools (memory half): trilium_remember, trilium_recall and the
 * weekly-report workflow. These encode the user's memory rules: AI writes
 * default to the memory directory (Agent笔记), recall searches that subtree,
 * and the weekly report follows the 周报撰写规范 style profile.
 */
import type { TriliumEtapi } from './etapi.ts';
import type { TriliumConfig } from './protocol.ts';
/** Write one memory note into the memory directory. */
export declare function triliumRememberTool(etapi: TriliumEtapi, getConfig: () => TriliumConfig): import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Recall from the memory directory. */
export declare function triliumRecallTool(etapi: TriliumEtapi, getConfig: () => TriliumConfig): import("@deepseek-ai/dsh-tools").ToolDefinition;
/**
 * Weekly-report workflow. Two modes:
 *  - no draft: collect the week's source material (本周工作 notes under
 *    关注项目/日程 + daily work logs) and return it for the agent to write
 *    up per the 周报撰写规范.
 *  - with draft: create the weekly report note under the schedule directory
 *    with startDate/endDate labels.
 */
export declare function triliumWeeklyReportTool(etapi: TriliumEtapi, getConfig: () => TriliumConfig): import("@deepseek-ai/dsh-tools").ToolDefinition;
