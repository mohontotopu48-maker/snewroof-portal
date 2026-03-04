'use client';

import { useState } from 'react';
import { Send, Phone, Mail, Paperclip } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const initialMessages = [
    { id: 1, sender: 'Support', text: 'Hello! How can we help you today with your roofing project?', time: '10:30 AM' },
    { id: 2, sender: 'User', text: 'Hi, I have a question about the shingle colors for the Main St project.', time: '10:32 AM' },
    { id: 3, sender: 'Support', text: 'Sure! We sent over the digital samples yesterday. Have you had a chance to look at them?', time: '10:35 AM' },
];

export default function MessagesPage() {
    useAuth();
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            sender: 'User',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setInput('');
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
                        {messages.map((msg) => (
                            <div key={msg.id} style={{
                                alignSelf: msg.sender === 'User' ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.sender === 'User' ? 'flex-end' : 'flex-start'
                            }}>
                                <div className={`bubble ${msg.sender === 'User' ? 'bubble-sent' : 'bubble-received'}`}>
                                    {msg.text}
                                </div>
                                <span style={{ fontSize: 10, color: 'var(--slate-500)', marginTop: 4 }}>{msg.time}</span>
                            </div>
                        ))}
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
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: 12 }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div style={{ width: 300, borderLeft: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)', padding: 24, display: 'none' }}>
                    {/* Responsive hidden for now, can be enabled for desktop */}
                </div>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .messages-info { display: block !important; }
                }
            `}</style>
        </div>
    );
}
