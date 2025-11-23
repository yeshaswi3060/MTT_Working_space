import React, { useEffect, useState, useRef } from 'react';
import { subscribeToMessages, sendMessage, type Message } from '../../../services/firestore';
import { auth } from '../../../services/firebase';

interface ChatRoomProps {
    teamId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ teamId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!teamId) return;
        const unsubscribe = subscribeToMessages(teamId, (updatedMessages) => {
            setMessages(updatedMessages);
        });
        return () => unsubscribe();
    }, [teamId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !auth.currentUser) return;

        try {
            await sendMessage(newMessage, auth.currentUser, teamId);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                {messages.map((msg) => {
                    const isMe = msg.uid === auth.currentUser?.uid;
                    return (
                        <div key={msg.id} style={{
                            display: 'flex',
                            flexDirection: isMe ? 'row-reverse' : 'row',
                            marginBottom: '1rem',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#333',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: isMe ? '0 0 0 0.5rem' : '0 0.5rem 0 0',
                                fontSize: '0.75rem',
                                flexShrink: 0
                            }}>
                                {msg.photoURL ? <img src={msg.photoURL} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : (msg.displayName?.[0] || 'A').toUpperCase()}
                            </div>
                            <div style={{
                                maxWidth: '70%',
                                backgroundColor: isMe ? 'black' : '#f0f0f0',
                                color: isMe ? 'white' : 'black',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                borderTopRightRadius: isMe ? '2px' : '12px',
                                borderTopLeftRadius: isMe ? '12px' : '2px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                                {!isMe && <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#666' }}>{msg.displayName}</div>}
                                <div style={{ wordBreak: 'break-word' }}>{msg.text}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid #e0e0e0', backgroundColor: 'white' }}>
                <form onSubmit={handleSend} style={{ display: 'flex' }}>
                    <input
                        type="text"
                        className="input-field"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        style={{ marginRight: '0.5rem' }}
                    />
                    <button type="submit" className="btn btn-primary">Send</button>
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;
