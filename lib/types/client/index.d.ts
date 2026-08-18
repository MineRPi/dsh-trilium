/**
 * Browser-half entry for dsh-trilium — runs inside the dsh web GUI.
 *
 * Registers the locale dictionaries and one plugin settings card
 * (settings.plugin.item, inside 设置 → 插件 → 可配置). The card reads/writes
 * the host JSON store through the /api/dsh-trilium routes (no
 * settings-namespace allowlist needed). Failure policy: mounting problems are
 * logged, never thrown — an external plugin must not take the GUI down.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type TriliumKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** dsh-trilium surface copy. */
        'dsh-trilium': TriliumKey;
    }
    interface SlotMap {
        /**
         * One plugin's card inside the plugin configuration section
         * (设置 → 插件 → 可配置). Declared here because this package does not
         * depend on the settings-plugins presentation package.
         */
        'settings.plugin.item': {
            kind: 'keyed';
            scope: 'root';
            owner: SettingsPluginItemOwnerProps;
        };
    }
}
/** Owner share of a plugin card (the section supplies nothing). */
export interface SettingsPluginItemOwnerProps {
    /** Marker field: card owner props are intentionally empty. */
    children?: never;
} /** Required services (fiber inject waiting — the runtime must be up first). */
export declare const inject: string[];
/** Type-only surface. */
export type { TriliumSettingsCardProps } from './TriliumSettingsCard.tsx';
export type { TriliumKey } from './locales.ts';
/**
 * Mount the Trilium surfaces.
 * @param ctx - client root context (slots + locale services).
 */
export declare function apply(ctx: ClientContext): void;
