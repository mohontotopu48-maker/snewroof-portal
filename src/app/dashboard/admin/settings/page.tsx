'use client';

import { useState, useEffect } from 'react';
import { getGlobalSettings, updateGlobalSettings } from '@/app/actions';
import { Settings, Code2, BarChart3, Paintbrush, CheckCircle2, AlertCircle, Save, Info, ExternalLink, RefreshCw } from 'lucide-react';

const TABS = [
    { id: 'ghl', label: 'Go High Level', icon: ExternalLink, color: '#f97316' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: '#22c55e' },
    { id: 'css', label: 'Custom CSS', icon: Paintbrush, color: '#a78bfa' },
];

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('ghl');
    const [ghlScript, setGhlScript] = useState('');
    const [analyticsScript, setAnalyticsScript] = useState('');
    const [customCss, setCustomCss] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            const s = await getGlobalSettings();
            setGhlScript(s?.ghl_script || '');
            setAnalyticsScript(s?.analytics_script || '');
            setCustomCss(s?.custom_css || '');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await updateGlobalSettings({
                ghl_script: ghlScript,
                analytics_script: analyticsScript,
                custom_css: customCss
            });
            setStatus({ type: 'success', msg: 'Settings saved! Changes will reflect globally across the portal.' });
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        } finally {
            setSaving(false);
        }
    };

    const activeTabInfo = TABS.find(t => t.id === activeTab);
    const placeholder: Record<string, string> = {
        ghl: `<!-- Paste your Go High Level chat widget or tracking script here -->\n<script src="https://widgets.leadconnectorhq.com/loader.js" ...></script>`,
        analytics: `<!-- Google Analytics 4, Facebook Pixel, or any tracking code -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXX');\n</script>`,
        css: `/* Override or extend any portal styles globally */\n:root {\n  --orange-500: #f97316;\n}\n\n.sidebar { border-right: 2px solid var(--orange-500); }`,
    };
    const valueMap: Record<string, string> = { ghl: ghlScript, analytics: analyticsScript, css: customCss };
    const setterMap: Record<string, (v: string) => void> = { ghl: setGhlScript, analytics: setAnalyticsScript, css: setCustomCss };

    return (
        <div className="animate-fade">
            <div className="page-header" style={{ marginBottom: 24 }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Settings size={22} color="var(--orange-400)" /> Portal Global Settings
                </h2>
                <p>Changes made here are injected into <strong>every page of the portal</strong> — automatically synced with the live database. Only GEO has access to this section.</p>
            </div>

            {status && (
                <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.msg}
                </div>
            )}

            <div className="grid-2" style={{ gap: 24 }}>
                {/* Left: Tabs + Editor */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Tab buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, borderColor: activeTab === tab.id ? tab.color : undefined, color: activeTab === tab.id ? tab.color : undefined, background: activeTab === tab.id ? `${tab.color}22` : undefined }}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Hint box */}
                    <div style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${activeTabInfo?.color}44`, background: `${activeTabInfo?.color}11`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <Info size={16} style={{ color: activeTabInfo?.color, marginTop: 2, flexShrink: 0 }} />
                        <div style={{ fontSize: 13, color: 'var(--slate-300)' }}>
                            {activeTab === 'ghl' && (<>Paste the full <strong style={{ color: activeTabInfo?.color }}>Go High Level</strong> chat widget embed code from your GHL account → Settings → Chat Widget. This will appear on every portal page.</>)}
                            {activeTab === 'analytics' && (<>Paste your <strong style={{ color: activeTabInfo?.color }}>Google Analytics 4, Facebook Pixel</strong>, or any other tracking HTML/script tags here. They'll be injected into the {"<head>"} of every page automatically.</>)}
                            {activeTab === 'css' && (<>Use <strong style={{ color: activeTabInfo?.color }}>custom CSS</strong> to override portal colors, fonts, spacing, or any visual style. Applies globally to every page and every user's view.</>)}
                        </div>
                    </div>

                    {/* Code Editor Area */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)' }}>
                            <Code2 size={16} color={activeTabInfo?.color} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: activeTabInfo?.color }}>{activeTabInfo?.label}</span>
                            {loading && <RefreshCw size={14} className="animate-spin" style={{ marginLeft: 'auto', opacity: 0.6 }} />}
                        </div>
                        {loading ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate-500)' }}>Loading settings...</div>
                        ) : (
                            <textarea
                                value={valueMap[activeTab]}
                                onChange={e => setterMap[activeTab](e.target.value)}
                                placeholder={placeholder[activeTab]}
                                spellCheck={false}
                                style={{
                                    width: '100%',
                                    minHeight: 400,
                                    background: '#0d1117',
                                    color: '#e6edf3',
                                    fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                    border: 'none',
                                    outline: 'none',
                                    padding: 24,
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                    display: 'block',
                                }}
                            />
                        )}
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button className="btn btn-secondary" onClick={fetchSettings} disabled={loading}>
                            <RefreshCw size={16} /> Reload from DB
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading} style={{ minWidth: 140 }}>
                            {saving ? <><RefreshCw size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save All Settings</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Panel */}
            <div className="card" style={{ marginTop: 24, background: 'rgba(249,115,22,0.03)', borderColor: 'rgba(249,115,22,0.15)' }}>
                <h4 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={16} color="var(--orange-400)" /> How it works
                </h4>
                <ul style={{ fontSize: 13, color: 'var(--slate-400)', display: 'grid', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                    <li>• <strong style={{ color: 'white' }}>Go High Level (GHL):</strong> Widget/chat scripts are injected into the portal {"<body>"} on every page load.</li>
                    <li>• <strong style={{ color: 'white' }}>Analytics:</strong> Any script (Google Analytics, Facebook Pixel, etc.) is injected into the global {"<head>"} as raw HTML, firing on every page view.</li>
                    <li>• <strong style={{ color: 'white' }}>Custom CSS:</strong> Style overrides are applied globally — customers and admins both see the updated styling immediately on next page load.</li>
                    <li>• <strong style={{ color: 'white' }}>Database sync:</strong> All settings are stored in the live InsForge {"portal_settings"} table and fetched on every server render — no code changes needed.</li>
                </ul>
            </div>
        </div>
    );
}
