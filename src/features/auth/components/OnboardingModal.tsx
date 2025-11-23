import React, { useState } from 'react';
import { auth } from '../../../services/firebase';
import { updateUserProfile } from '../../../services/firestore';

interface OnboardingModalProps {
    onComplete: (data: { nickname: string; discriminator: string }) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting nickname:", nickname);
        if (!nickname.trim() || !auth.currentUser) return;

        setLoading(true);
        setError('');

        try {
            // Generate random 4-digit discriminator
            const discriminator = Math.floor(1000 + Math.random() * 9000).toString();
            const fullDisplayName = `${nickname}#${discriminator}`;
            console.log("Generated full name:", fullDisplayName);

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Save operation timed out. Please check your connection.')), 10000)
            );

            const updatePromise = updateUserProfile(auth.currentUser, {
                displayName: fullDisplayName,
                nickname: nickname,
                discriminator: discriminator
            });

            console.log("Calling updateUserProfile...");
            // Race the update against a timeout
            try {
                await Promise.race([updatePromise, timeoutPromise]);
                console.log("Profile updated successfully");
            } catch (error: any) {
                if (error.message.includes('timed out')) {
                    console.warn("Save timed out, proceeding optimistically (offline mode)");
                    // Proceed anyway, assuming persistence will handle it
                } else {
                    throw error;
                }
            }

            onComplete({ nickname, discriminator });
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Complete Your Profile</h2>
                <p style={{ marginBottom: '1.5rem', color: '#666', textAlign: 'center', fontSize: '0.875rem' }}>
                    Choose a nickname to identify yourself in the workspace. We'll assign you a unique #number.
                </p>

                {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="nickname">Nickname</label>
                        <input
                            id="nickname"
                            type="text"
                            className="input-field"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="e.g. Maverick"
                            maxLength={15}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Join Workspace'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingModal;
