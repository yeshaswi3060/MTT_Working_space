import React, { useState } from 'react';
import { auth } from '../../../services/firebase';
import { updateUserProfile } from '../../../services/firestore';

interface JoinTeamSidebarProps {
    onJoinSuccess: () => void;
}

const JoinTeamSidebar: React.FC<JoinTeamSidebarProps> = ({ onJoinSuccess }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setError('');
        setLoading(true);

        try {
            if (code.trim() === 'testing') {
                if (auth.currentUser) {
                    // Create a timeout promise
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Join operation timed out')), 10000)
                    );

                    const updatePromise = updateUserProfile(auth.currentUser, { teamId: 'testing-team' });

                    try {
                        await Promise.race([updatePromise, timeoutPromise]);
                    } catch (error: any) {
                        if (error.message.includes('timed out')) {
                            console.warn("Join timed out, proceeding optimistically (offline mode)");
                        } else {
                            throw error;
                        }
                    }

                    onJoinSuccess();
                }
            } else {
                setError('Invalid team code. Please try again.');
            }
        } catch (err) {
            console.error('Error joining team:', err);
            setError('Failed to join team.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: '300px',
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Join a Team</h2>

            <form onSubmit={handleJoin}>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <label className="input-label" htmlFor="teamCode">Team Code</label>
                    <input
                        id="teamCode"
                        type="text"
                        className="input-field"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter code"
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                {error && <div style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Joining...' : 'Join Team'}
                </button>
            </form>

            <div style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.875rem', color: '#666' }}>
                <p>Ask your administrator for the team access code.</p>
            </div>
        </div>
    );
};

export default JoinTeamSidebar;
