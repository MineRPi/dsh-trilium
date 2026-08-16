/**
 * Browser-half entry for dsh-trilium — runs inside the dsh web GUI.
 *
 * Registers the locale dictionaries and one plugin settings card
 * (settings.plugin.item, inside 设置 → 插件 → 可配置). The card reads/writes
 * the host JSON store through the /api/dsh-trilium routes (no
 * settings-namespace allowlist needed). Failure policy: mounting problems are
 * logged, never thrown — an external plugin must not take the GUI down.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the settings-surface SlotMap merge (settings.section).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { TriliumApi } from './api.ts'
import { zh, type TriliumKey } from './locales.ts'
import { TriliumSettingsCard, type TriliumSettingsFace } from './TriliumSettingsCard.tsx'

/** Locale namespace this plugin owns. */
const NS = 'dsh-trilium'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** dsh-trilium surface copy. */
    'dsh-trilium': TriliumKey
  }

  interface SlotMap {
    /**
     * One plugin's card inside the plugin configuration section
     * (设置 → 插件 → 可配置). Declared here because this package does not
     * depend on the settings-plugins presentation package.
     */
    'settings.plugin.item': { kind: 'list'; scope: 'root'; owner: SettingsPluginItemOwnerProps }
  }
}

/** Owner share of a plugin card (the section supplies nothing). */
export interface SettingsPluginItemOwnerProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}/** Required services (fiber inject waiting — the runtime must be up first). */
export const inject = ['slots', 'locale']

/** Type-only surface. */
export type { TriliumSettingsCardProps } from './TriliumSettingsCard.tsx'
export type { TriliumKey } from './locales.ts'

/**
 * Mount the Trilium surfaces.
 * @param ctx - client root context (slots + locale services).
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en: zh }), 'dsh-trilium: dictionaries')

  const api = new TriliumApi()

  // One plugin settings card inside 设置 → 插件 → 可配置 (settings.plugin.item),
  // side by side with the built-in cards and third-party cards like 语音输入.
  // Reads/writes the host JSON store directly through the
  // /api/dsh-trilium/config routes (no settings-namespace allowlist needed).
  const disposeSettings = ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'trilium',
    order: 120,
    locale: NS,
    inject: (): TriliumSettingsFace => ({ api }),
  }, TriliumSettingsCard as never))

  // Note browsing is done through the trilium_* agent tools; this client half
  // intentionally mounts only the settings card (no sidebar panel).
  ctx.effect(() => disposeSettings, 'dsh-trilium: ui mounts')
}