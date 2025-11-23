import React from 'react';
import { UserProfile } from '../../../services/firestore';

interface UserDetailModalProps {
    user: UserProfile;
    onClose: () => void;
    onStartCall: () => void;
    onMessage: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose, onStartCall, onMessage }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                width: '320px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }} onClick={e => e.stopPropagation()}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    {user.nickname ? user.nickname[0].toUpperCase() : (user.displayName ? user.displayName[0].toUpperCase() : '?')}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                        {user.nickname || user.displayName || 'Unknown User'}
                    </h2>
                    {user.discriminator && (
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>#{user.discriminator}</span>
                    )}
                    <div style={{
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: user.status === 'online' ? '#28a745' : '#6c757d'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: user.status === 'online' ? '#28a745' : '#6c757d'
                        }} />
                        {user.status === 'online' ? 'Online' : 'Offline'}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    <button
                        onClick={onStartCall}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#000',
                            color: 'white',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>📹</span> Video Call
                    </button>
                    <button
                        onClick={onMessage}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            backgroundColor: 'white',
                            color: '#333',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <span>💬</span> Message
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
