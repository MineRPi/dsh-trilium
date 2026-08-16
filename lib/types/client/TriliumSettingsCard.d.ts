/**
 * The dsh-trilium settings card: one plugin card inside 设置 → 插件 → 可配置
 * (settings.plugin.item), side by side with the built-in Shell / Agent loop /
 * Web search cards and third-party cards like 语音输入.
 *
 * Data path: reads/writes the host JSON store directly through the
 * /api/dsh-trilium/config routes — deliberately NOT the settings-namespace
 * document, which is allowlist-gated for third-party namespaces. The JSON
 * store (~/.dsh/dsh-trilium.json, 0600) is the single runtime source.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { TriliumApi } from './api.ts';
/** The registration-side face the slot entry injects. */
export interface TriliumSettingsFace {
    api: TriliumApi;
}
/** Props the section renderer binds for the card. */
export type TriliumSettingsCardProps = PropsRuntime<'settings.plugin.item'> & PropsLocale<'dsh-trilium'> & InjectFace<TriliumSettingsFace>;
/**
 * Render the collapsible plugin settings card.
 * @param props - locale copy and the API client.
 * @returns the card.
 */
export declare function TriliumSettingsCard(props: TriliumSettingsCardProps): import("react").JSX.Element;
