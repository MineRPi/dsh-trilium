import { TriliumApi } from "./api.js";
import { zh } from "./locales.js";
import { TriliumSettingsCard } from "./TriliumSettingsCard.js";
/** Locale namespace this plugin owns. */
const NS = 'dsh-trilium';
export const inject = ['slots', 'locale'];
/**
 * Mount the Trilium surfaces.
 * @param ctx - client root context (slots + locale services).
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en: zh }), 'dsh-trilium: dictionaries');
    const api = new TriliumApi();
    // One plugin settings card inside 设置 → 插件 → 可配置 (settings.plugin.item),
    // side by side with the built-in cards and third-party cards like 语音输入.
    // Reads/writes the host JSON store directly through the
    // /api/dsh-trilium/config routes (no settings-namespace allowlist needed).
    // rc7: settings.plugin.item is keyed by the settings namespace; the Host
    // serves 'dsh-trilium' via installSettingsSection and the plugin-config tab
    // dispatches this card for that key.
    const disposeSettings = ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
        name: 'settings.plugin.item',
        key: 'dsh-trilium',
        locale: NS,
        inject: () => ({ api }),
    }, TriliumSettingsCard));
    // Note browsing is done through the trilium_* agent tools; this client half
    // intentionally mounts only the settings card (no sidebar panel).
    ctx.effect(() => disposeSettings, 'dsh-trilium: ui mounts');
}
