'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Mail, Paperclip, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';


interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    sender?: {
        full_name: string;
        avatar_url: string;
    };
}

import { getMessages, sendMessage } from '@/app/actions';

export default function MessagesPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user?.id) {
            doFetchMessages();
            // Real-time subscription placeholder
        }
    }, [user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const doFetchMessages = async () => {
        try {
            const data = await getMessages();
            setMessages(data as unknown as Message[]);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user?.id || sending) return;

        setSending(true);
        try {
            await sendMessage(input);
            setInput('');
            doFetchMessages();
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="animate-fade" style={{ height: 'calc(100vh - var(--topbar-h) - 64px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 20 }}>
                <h2>Messages</h2>
                <p>Chat directly with your project manager and support team.</p>
            </div>

            <div className="card" style={{ flex: 1, display: 'flex', padding: 0, overflow: 'hidden' }}>
                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        padding: '16px 24px', borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="avatar" style={{ background: 'var(--orange-500)' }}>S</div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Snewroof Support</div>
                                <div style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                                    Online
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-secondary btn-sm"><Phone size={14} /></button>
                            <button className="btn btn-secondary btn-sm"><Mail size={14} /></button>
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                                <Loader2 className="animate-spin" size={24} style={{ color: 'var(--orange-500)' }} />
                            </div>
                        ) : messages.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--slate-500)', padding: 40 }}>
                                <p>No messages yet. Send a message to start the conversation.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                                    maxWidth: '75%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: msg.sender_id === user?.id ? 'flex-end' : 'flex-start'
                                }}>
                                    <div className={`bubble ${msg.sender_id === user?.id ? 'bubble-sent' : 'bubble-received'}`}>
                                        {msg.content}
                                    </div>
                                    <span style={{ fontSize: 10, color: 'var(--slate-500)', marginTop: 4 }}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: 24, borderTop: '1px solid var(--border)' }}>
                        <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
                            <button type="button" className="btn btn-secondary" style={{ padding: 12 }}>
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Type your message..."
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
            </div>
        </div>
    );
}
