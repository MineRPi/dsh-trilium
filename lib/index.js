/**
 * dsh-trilium — host half. Mounts the ETAPI client, the /api/dsh-trilium
 * route family (config store + browser helpers), the agent tools
 * (trilium_*), the system-prompt announcement (plugin capabilities + memory
 * rules) and the live memory-index section (auto-injected per session when
 * enabled). The browser half (./client) renders the standalone settings
 * page (设置 → Trilium 记忆库).
 */
import z from '@deepseek-ai/schemastery';
import { TriliumEtapi } from "./etapi.js";
import { buildMemoryIndex, readCachedIndex, TRILIUM_GUIDANCE } from "./memory.js";
import { readConfig } from "./store.js";
import { makeRoutes } from "./routes.js";
import { triliumAppInfoTool, triliumAttributeTool, triliumCreateNoteTool, triliumDeleteNoteTool, triliumExportTool, triliumGetNoteTool, triliumHistoryTool, triliumListChildrenTool, triliumSearchTool, triliumUndeleteNoteTool, triliumUpdateNoteTool, } from "./tools.js";
import { triliumRecallTool, triliumRememberTool, triliumWeeklyReportTool, } from "./tools-memory.js";
import { triliumAttachmentTool, triliumBackupTool, triliumCalendarTool, triliumCloneTool, triliumImportTool, triliumRevisionsTool, } from "./tools-extra.js";
/** Stable cordis plugin name. */
export const name = 'trilium';
/** Services required before the Trilium surfaces can mount. */
export const inject = ['webServer', 'tools', 'systemPrompt'];
export const Config = z.object({
    enabled: z.boolean().default(true),
    announceToAgent: z.boolean().default(true),
});
/** Schema default, re-read for hand-built test contexts. */
const DEFAULT_ANNOUNCE = true;
/** Order of the announcement section within the tool-guidance band. */
const SECTION_ORDER = 150;
/** Order of the live memory-index section (after the announcement). */
const MEMORY_SECTION_ORDER = 152;
/** Prefix line for the injected index section. */
const TRILIUM_GUIDANCE_INDEX_PREFIX = '【Trilium 记忆索引（自动注入，autoInject 可关）】';
export function apply(ctx, config) {
    let current = () => config ?? {};
    const resolve = () => {
        const value = current();
        return {
            announceToAgent: value.announceToAgent ?? DEFAULT_ANNOUNCE,
            enabled: value.enabled ?? true,
        };
    };
    const etapi = new TriliumEtapi(() => readConfig());
    const routes = makeRoutes({ etapi });
    // Warm the memory-index cache in the background so the first session
    // assembly already has an index (the section provider reads cache sync).
    let indexReady = false;
    const warmIndex = () => {
        if (indexReady)
            return;
        indexReady = true;
        void buildMemoryIndex(etapi, readConfig()).catch(() => undefined);
    };
    warmIndex();
    const toolFactories = [
        () => triliumAppInfoTool(etapi),
        () => triliumSearchTool(etapi),
        () => triliumGetNoteTool(etapi),
        () => triliumListChildrenTool(etapi),
        () => triliumCreateNoteTool(etapi, () => readConfig()),
        () => triliumUpdateNoteTool(etapi),
        () => triliumDeleteNoteTool(etapi, () => readConfig()),
        () => triliumUndeleteNoteTool(etapi),
        () => triliumAttributeTool(etapi),
        () => triliumExportTool(etapi),
        () => triliumHistoryTool(etapi),
        () => triliumRememberTool(etapi, () => readConfig()),
        () => triliumRecallTool(etapi, () => readConfig()),
        () => triliumWeeklyReportTool(etapi, () => readConfig()),
        () => triliumCloneTool(etapi),
        () => triliumAttachmentTool(etapi),
        () => triliumCalendarTool(etapi),
        () => triliumBackupTool(etapi),
        () => triliumImportTool(etapi),
        () => triliumRevisionsTool(etapi),
    ];
    let disposeSection;
    let disposeMemorySection;
    let disposeRoutes;
    let disposeTools;
    const sync = () => {
        if (disposeSection !== undefined) {
            disposeSection();
            disposeSection = undefined;
        }
        if (disposeMemorySection !== undefined) {
            disposeMemorySection();
            disposeMemorySection = undefined;
        }
        if (disposeRoutes !== undefined) {
            disposeRoutes();
            disposeRoutes = undefined;
        }
        if (disposeTools !== undefined) {
            disposeTools();
            disposeTools = undefined;
        }
        const value = resolve();
        if (!value.enabled)
            return;
        if (value.announceToAgent) {
            disposeSection = ctx.systemPrompt.section({
                name: 'plugin:dsh-trilium',
                order: SECTION_ORDER,
                text: TRILIUM_GUIDANCE,
            });
        }
        disposeMemorySection = ctx.systemPrompt.section({
            name: 'plugin:dsh-trilium:memory-index',
            order: MEMORY_SECTION_ORDER,
            text: () => {
                const cfg = readConfig();
                if (!cfg.autoInject)
                    return '';
                void buildMemoryIndex(etapi, cfg).catch(() => undefined);
                return '\n' + TRILIUM_GUIDANCE_INDEX_PREFIX + '\n' + readCachedIndex();
            },
        });
        disposeRoutes = ctx.effect(() => {
            const disposers = routes.map(route => ctx.webServer.register(route));
            return () => { for (const dispose of disposers)
                dispose(); };
        }, 'dsh-trilium: routes');
        disposeTools = ctx.effect(() => {
            const disposers = toolFactories.map(factory => ctx.tools.register(factory()));
            return () => { for (const dispose of disposers)
                dispose(); };
        }, 'dsh-trilium: tools');
    };
    sync();
}
