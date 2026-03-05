'use client';

import { useState, useEffect, useRef } from 'react';
import { getAdminMessages, sendAdminMessage, getProfile } from '@/app/actions';
import { Send, Loader2, MessageCircle } from 'lucide-react';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    sender?: { full_name: string; avatar_url: string; };
    receiver?: { full_name: string; avatar_url: string; };
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [adminId, setAdminId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Derived state for the sidebar
    const [conversations, setConversations] = useState<{ id: string, name: string, lastMsg: string, time: string }[]>([]);
    const [activeUserId, setActiveUserId] = useState<string | null>(null);

    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
        // Set up interval for polling just for the demo
        const interval = setInterval(doFetchMessagesOnly, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [profile, data] = await Promise.all([getProfile(), getAdminMessages()]);
            if (profile) setAdminId(profile.id);
            processMessages(data, profile?.id || '');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const doFetchMessagesOnly = async () => {
        if (!adminId) return;
        try {
            const data = await getAdminMessages();
            processMessages(data, adminId);
        } catch (err) {
            console.error(err);
        }
    };

    const processMessages = (data: any[], currentAdminId: string) => {
        setMessages(data);

        // Group by user
        const convMap = new Map<string, any>();
        data.forEach(msg => {
            const otherId = msg.sender_id === currentAdminId ? msg.receiver_id : msg.sender_id;
            const otherData = msg.sender_id === currentAdminId ? msg.receiver : msg.sender;

            convMap.set(otherId, {
                id: otherId,
                name: otherData?.full_name || 'Unknown Customer',
                lastMsg: msg.content,
                time: msg.created_at
            });
        });

        const convs = Array.from(convMap.values()).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setConversations(convs);

        // If no active user, select the first one
        if (!activeUserId && convs.length > 0) {
            setActiveUserId(convs[0].id);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeUserId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !activeUserId || sending) return;

        setSending(true);
        try {
            await sendAdminMessage(activeUserId, input);
            setInput('');
            doFetchMessagesOnly();
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    const activeMessages = messages.filter(m => m.sender_id === activeUserId || m.receiver_id === activeUserId);
    const activeUser = conversations.find(c => c.id === activeUserId);

    return (
        <div className="animate-fade" style={{ height: 'calc(100vh - var(--topbar-h) - 40px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 20 }}>
                <h2>Client Messages</h2>
                <p>View and respond to client inquiries and notes.</p>
            </div>

            <div className="card" style={{ flex: 1, display: 'flex', padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" size={24} style={{ color: 'var(--orange-500)' }} />
                    </div>
                ) : conversations.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-500)' }}>
                        <MessageCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                        <h3>No messages yet</h3>
                        <p>When customers send notes, they will appear here.</p>
                    </div>
                ) : (
                    <>
                        {/* Sidebar */}
                        <div style={{ width: 300, borderRight: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ margin: 0, fontSize: 14 }}>Conversations</h3>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {conversations.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => setActiveUserId(c.id)}
                                        style={{
                                            padding: '16px 20px',
                                            borderBottom: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            background: activeUserId === c.id ? 'rgba(249,115,22,0.1)' : 'transparent',
                                            borderLeft: activeUserId === c.id ? '3px solid var(--orange-500)' : '3px solid transparent'
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, color: activeUserId === c.id ? 'var(--orange-400)' : 'white', marginBottom: 4 }}>{c.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--slate-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMsg}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        {activeUserId ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    padding: '16px 24px', borderBottom: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 16 }}>{activeUser?.name}</h3>
                                        <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>Customer</div>
                                    </div>
                                </div>

                                <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {activeMessages.map((msg) => (
                                        <div key={msg.id} style={{
                                            alignSelf: msg.sender_id === adminId ? 'flex-end' : 'flex-start',
                                            maxWidth: '75%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: msg.sender_id === adminId ? 'flex-end' : 'flex-start'
                                        }}>
                                            <div className={`bubble ${msg.sender_id === adminId ? 'bubble-sent' : 'bubble-received'}`}>
                                                {msg.content}
                                            </div>
                                            <span style={{ fontSize: 10, color: 'var(--slate-500)', marginTop: 4 }}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div style={{ padding: 24, borderTop: '1px solid var(--border)', background: 'var(--navy-900)' }}>
                                    <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={`Reply to ${activeUser?.name}...`}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            style={{ flex: 1 }}
                                            disabled={sending}
                                        />
                                        <button type="submit" className="btn btn-primary" style={{ padding: 12 }} disabled={sending || !input.trim()}>
                                            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-500)' }}>
                                Select a conversation
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
