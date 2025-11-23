import React, { useEffect, useState } from 'react';
import { subscribeToUsers, type UserProfile } from '../../../services/firestore';
import { useCall } from '../../../context/CallContext';
import { auth } from '../../../services/firebase';

import UserDetailModal from './UserDetailModal';

interface UserListProps {
    teamId: string;
}

const UserList: React.FC<UserListProps> = ({ teamId }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const { startCall } = useCall();

    useEffect(() => {
        console.log("UserList mounted, teamId:", teamId);
        if (!teamId) return;
        const unsubscribe = subscribeToUsers(teamId, (newUsers) => {
            console.log("UserList received users:", newUsers);
            // Sort: online users first, then by displayName
            const sorted = [...newUsers].sort((a, b) => {
                if (a.status === 'online' && b.status !== 'online') return -1;
                if (a.status !== 'online' && b.status === 'online') return 1;
                return (a.displayName || '').localeCompare(b.displayName || '');
            });
            setUsers(sorted);
        });
        return () => unsubscribe();
    }, [teamId]);

    const handleUserClick = (user: UserProfile) => {
        if (user.uid !== auth.currentUser?.uid) {
            setSelectedUser(user);
        }
    };

    const handleStartCall = () => {
        if (selectedUser) {
            startCall(selectedUser.uid);
            setSelectedUser(null);
        }
    };

    const handleMessage = () => {
        // Placeholder for direct message logic
    };

    return (
        <div style={{
            width: '280px',
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: 'white'
            }}>
                <h2 style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    margin: 0,
                    color: '#333'
                }}>
                    Team Members
                </h2>
                <div style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginTop: '0.25rem'
                }}>
                    {users.length} member{users.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
                {users.map((user) => {
                    const isCurrentUser = user.uid === auth.currentUser?.uid;
                    const isOnline = user.status === 'online';

                    return (
                        <div
                            key={user.uid}
                            onClick={() => !isCurrentUser && handleUserClick(user)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: isCurrentUser ? 'default' : 'pointer',
                                backgroundColor: isCurrentUser ? '#e8f5e9' : 'transparent',
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (!isCurrentUser) {
                                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isCurrentUser) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                } else {
                                    e.currentTarget.style.backgroundColor = '#e8f5e9';
                                }
                            }}
                        >
                            {/* Avatar */}
                            <div style={{
                                position: 'relative',
                                width: '40px',
                                height: '40px',
                                flexShrink: 0
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}>
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        (user.nickname?.[0] || user.displayName?.[0] || 'U').toUpperCase()
                                    )}
                                </div>

                                {/* Online/Offline Status Indicator */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    right: '2px',
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: isOnline ? '#4CAF50' : '#9e9e9e',
                                    border: '2px solid #f8f9fa'
                                }} />
                            </div>

                            {/* User Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: isCurrentUser ? 'bold' : 'normal',
                                    color: '#333',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {user.nickname ? `${user.nickname}#${user.discriminator}` : user.displayName}
                                    {isCurrentUser && (
                                        <span style={{
                                            marginLeft: '0.5rem',
                                            fontSize: '0.75rem',
                                            color: '#4CAF50',
                                            fontWeight: 'normal'
                                        }}>
                                            (You)
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: isOnline ? '#4CAF50' : '#9e9e9e',
                                    marginTop: '2px'
                                }}>
                                    {isOnline ? 'Online' : 'Offline'}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {users.length === 0 && (
                    <div style={{
                        padding: '2rem 1.25rem',
                        textAlign: 'center',
                        color: '#999',
                        fontSize: '0.875rem'
                    }}>
                        No team members yet
                    </div>
                )}
            </div>

            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onStartCall={handleStartCall}
                    onMessage={handleMessage}
                />
            )}
        </div>
    );
};

export default UserList;

