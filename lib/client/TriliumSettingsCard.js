import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useEffect, useState } from 'react';
const EMPTY = {
    baseUrl: '',
    token: '',
    memoryNoteId: '',
    timeoutMs: '15000',
    autoInject: true,
    deleteConfirm: true,
    tokenSet: false,
};
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0', borderTop: '1px solid var(--dsw-alias-border-l2)' };
const labelStyle = { fontSize: 13, fontWeight: 500, color: 'var(--dsw-alias-label-primary)' };
const inputStyle = {
    border: '1px solid var(--dsw-alias-border-l2)',
    background: 'var(--dsw-alias-bg-layer-3)',
    height: 34,
    borderRadius: 8,
    padding: '0 12px',
    fontSize: 13,
    color: 'var(--dsw-alias-label-primary)',
};
const hintStyle = { color: 'var(--dsw-alias-label-tertiary)', margin: 0, fontSize: 12, lineHeight: 1.5 };
const buttonStyle = {
    border: '1px solid var(--dsw-alias-border-l2)',
    background: 'var(--dsw-alias-bg-layer-3)',
    color: 'var(--dsw-alias-label-primary)',
    borderRadius: 8,
    padding: '6px 16px',
    fontSize: 13,
    cursor: 'pointer',
};
function TextField(props) {
    return (_jsxs("div", { style: fieldStyle, children: [_jsx("label", { style: labelStyle, htmlFor: props.id, children: props.label }), _jsx("input", { id: props.id, style: inputStyle, type: props.password === true ? 'password' : 'text', autoComplete: "off", placeholder: props.placeholder, value: props.value, disabled: props.disabled, onChange: (event) => { props.onEdit(event.target.value); } }), _jsx("p", { style: hintStyle, children: props.hint })] }));
}
function Toggle(props) {
    return (_jsxs("div", { style: fieldStyle, children: [_jsxs("label", { style: { ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }, htmlFor: props.id, children: [_jsx("input", { id: props.id, type: "checkbox", checked: props.checked, disabled: props.disabled, onChange: (event) => { props.onEdit(event.target.checked); } }), _jsx("span", { children: props.label })] }), _jsx("p", { style: hintStyle, children: props.hint })] }));
}
/**
 * Render the collapsible plugin settings card.
 * @param props - locale copy and the API client.
 * @returns the card.
 */
export function TriliumSettingsCard(props) {
    const { t, api } = props;
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [loadError, setLoadError] = useState();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState();
    const [busy, setBusy] = useState(false);
    const [testResult, setTestResult] = useState('idle');
    const [testMessage, setTestMessage] = useState();
    // Load the stored config once, on first expand.
    useEffect(() => {
        if (!open || loaded)
            return;
        setLoading(true);
        api.getConfig().then(config => {
            setForm({
                baseUrl: config.baseUrl,
                token: '',
                memoryNoteId: config.memoryNoteId,
                timeoutMs: String(config.timeoutMs),
                autoInject: config.autoInject,
                deleteConfirm: config.deleteConfirm,
                tokenSet: config.tokenSet,
            });
            setLoaded(true);
            setLoading(false);
        }).catch((error) => {
            setLoadError(error instanceof Error ? error.message : String(error));
            setLoading(false);
        });
    }, [open, loaded, api]);
    const save = async () => {
        setSaving(true);
        setSaved(false);
        setSaveError(undefined);
        try {
            const config = await api.putConfig({
                baseUrl: form.baseUrl,
                token: form.token,
                memoryNoteId: form.memoryNoteId,
                timeoutMs: Number.parseInt(form.timeoutMs, 10),
                autoInject: form.autoInject,
                deleteConfirm: form.deleteConfirm,
            });
            setForm(prev => ({ ...prev, token: '', tokenSet: config.tokenSet }));
            setSaved(true);
        }
        catch (error) {
            setSaveError(error instanceof Error ? error.message : String(error));
        }
        finally {
            setSaving(false);
        }
    };
    const runTest = async () => {
        setBusy(true);
        setTestResult('idle');
        setTestMessage(undefined);
        try {
            const outcome = await api.test(form.baseUrl, form.token);
            if (outcome.ok) {
                setTestResult('ok');
                setTestMessage((outcome.appInfo?.appVersion ?? '') + ' · ' + (outcome.latencyMs ?? 0) + 'ms');
            }
            else {
                setTestResult('fail');
                setTestMessage(outcome.error ?? 'unknown');
            }
        }
        catch (error) {
            setTestResult('fail');
            setTestMessage(error instanceof Error ? error.message : String(error));
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("li", { style: {
            border: '1px solid var(--dsw-alias-border-l2)',
            background: 'var(--dsw-alias-bg-layer-3)',
            borderRadius: 12,
            listStyle: 'none',
            overflow: 'hidden',
        }, children: [_jsxs("button", { type: "button", style: {
                    width: '100%',
                    font: 'inherit',
                    color: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                }, "aria-expanded": open, onClick: () => { setOpen(!open); }, children: [_jsxs("span", { style: { display: 'flex', flexDirection: 'column', flex: 1, gap: 4, minWidth: 0 }, children: [_jsx("span", { style: { color: 'var(--dsw-alias-label-primary)', fontSize: 15, fontWeight: 600 }, children: t('settings.title') }), _jsx("span", { style: { color: 'var(--dsw-alias-label-tertiary)', fontSize: 13 }, children: t('settings.description') })] }), _jsx("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": "true", style: { transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.16s', flexShrink: 0 }, children: _jsx("path", { d: "M3.5 5.5 7 9l3.5-3.5", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })] }), open
                ? (_jsxs("div", { style: { borderTop: '1px solid var(--dsw-alias-border-l2)', margin: '0 16px', paddingBottom: 12 }, children: [loading ? _jsx("p", { style: hintStyle, children: t('panel.loading') }) : null, loadError !== undefined ? _jsxs("p", { style: { color: 'var(--dsw-alias-label-error)', fontSize: 12 }, children: [t('panel.error'), loadError] }) : null, !loading && loadError === undefined
                            ? (_jsxs("div", { style: { display: 'flex', flexDirection: 'column' }, children: [_jsx(TextField, { id: "tri-base-url", label: t('settings.baseUrl'), hint: t('settings.baseUrlHint'), value: form.baseUrl, disabled: saving, onEdit: (v) => { setForm(p => ({ ...p, baseUrl: v })); setSaved(false); } }), _jsx(TextField, { id: "tri-token", label: t('settings.token'), hint: t('settings.tokenHint'), value: form.token, disabled: saving, password: true, placeholder: form.tokenSet ? '已配置（留空保持不变）' : '粘贴 ETAPI token', onEdit: (v) => { setForm(p => ({ ...p, token: v })); setSaved(false); } }), _jsx(TextField, { id: "tri-memory", label: t('settings.memoryNoteId'), hint: t('settings.memoryNoteIdHint'), value: form.memoryNoteId, disabled: saving, onEdit: (v) => { setForm(p => ({ ...p, memoryNoteId: v })); setSaved(false); } }), _jsx(TextField, { id: "tri-timeout", label: t('settings.timeoutMs'), hint: t('settings.timeoutMsHint'), value: form.timeoutMs, disabled: saving, onEdit: (v) => { setForm(p => ({ ...p, timeoutMs: v })); setSaved(false); } }), _jsx(Toggle, { id: "tri-auto-inject", label: t('settings.autoInject'), hint: t('settings.autoInjectHint'), checked: form.autoInject, disabled: saving, onEdit: (v) => { setForm(p => ({ ...p, autoInject: v })); setSaved(false); } }), _jsx(Toggle, { id: "tri-delete-confirm", label: t('settings.deleteConfirm'), hint: t('settings.deleteConfirmHint'), checked: form.deleteConfirm, disabled: saving, onEdit: (v) => { setForm(p => ({ ...p, deleteConfirm: v })); setSaved(false); } }), saved ? _jsx("p", { style: { color: 'var(--dsw-alias-state-success-primary, #3cb371)', fontSize: 12, margin: '8px 0 0' }, children: t('settings.saved') }) : null, saveError !== undefined ? _jsxs("p", { style: { color: 'var(--dsw-alias-label-error)', fontSize: 12, margin: '8px 0 0' }, children: [t('settings.saveFailed'), saveError] }) : null, testResult === 'ok' ? _jsxs("p", { style: { color: 'var(--dsw-alias-state-success-primary, #3cb371)', fontSize: 12, margin: '8px 0 0' }, children: [t('settings.testOk'), " ", testMessage] }) : null, testResult === 'fail' ? _jsxs("p", { style: { color: 'var(--dsw-alias-label-error)', fontSize: 12, margin: '8px 0 0' }, children: [t('settings.testFail'), testMessage] }) : null, _jsxs("div", { style: { display: 'flex', gap: 10, padding: '14px 0 4px' }, children: [_jsx("button", { type: "button", style: buttonStyle, disabled: busy || saving || form.baseUrl.trim() === '', onClick: () => { void runTest(); }, children: busy ? t('settings.testing') : t('settings.test') }), _jsx("button", { type: "button", style: { ...buttonStyle, borderColor: 'transparent' }, disabled: saving, onClick: () => { void save(); }, children: saving ? t('settings.saving') : t('settings.save') })] })] }))
                            : null] }))
                : null] }));
}
