import React, { useEffect, useState } from 'react';
import UserList from './UserList';
import ChatRoom from '../../chat/components/ChatRoom';
import OnboardingModal from '../../auth/components/OnboardingModal';
import WelcomeView from './WelcomeView';
import JoinTeamSidebar from './JoinTeamSidebar';
import { auth } from '../../../services/firebase';
import { updateUserStatus, db } from '../../../services/firestore';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const WorkspaceLayout: React.FC = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [hasJoinedTeam, setHasJoinedTeam] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<{ nickname: string; discriminator: string; teamId?: string } | null>(null);

    useEffect(() => {
        let unsubscribe: () => void;

        const setupProfileListener = async () => {
            if (!auth.currentUser) return;

            setCheckingProfile(true);

            // 1. Try to load from localStorage first for immediate UI
            const cachedProfile = localStorage.getItem(`user_profile_${auth.currentUser.uid}`);
            if (cachedProfile) {
                try {
                    const parsed = JSON.parse(cachedProfile);
                    console.log("Loaded profile from localStorage:", parsed);
                    setUserProfile(parsed);
                    if (parsed.teamId) setHasJoinedTeam(true);
                    setShowOnboarding(false);
                    setCheckingProfile(false); // Unblock UI immediately
                } catch (e) {
                    console.error("Error parsing cached profile", e);
                }
            }

            // 2. Setup Firestore listener for real-time updates and sync
            const userRef = doc(db, 'users', auth.currentUser.uid);
            unsubscribe = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const profileData = {
                        nickname: userData.nickname,
                        discriminator: userData.discriminator,
                        teamId: userData.teamId
                    };

                    if (userData.nickname && userData.discriminator) {
                        setUserProfile(profileData as any);
                        // Update localStorage
                        localStorage.setItem(`user_profile_${auth.currentUser!.uid}`, JSON.stringify(profileData));

                        if (userData.teamId) {
                            setHasJoinedTeam(true);
                        }
                        setShowOnboarding(false);
                    } else {
                        // Only show onboarding if we don't have local storage data either
                        if (!localStorage.getItem(`user_profile_${auth.currentUser!.uid}`)) {
                            setShowOnboarding(true);
                        }
                    }
                } else {
                    if (!localStorage.getItem(`user_profile_${auth.currentUser!.uid}`)) {
                        setShowOnboarding(true);
                    }
                }
                setCheckingProfile(false);
                updateUserStatus(auth.currentUser!, 'online');
            }, (error) => {
                console.error("Firestore snapshot error:", error);
                // If we have cached data, ignore the error. If not, show error.
                if (!localStorage.getItem(`user_profile_${auth.currentUser!.uid}`)) {
                    setError("Connection failed. Using offline mode if available.");
                    setCheckingProfile(false);
                }
            });
        };

        setupProfileListener();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const handleOnboardingComplete = (data: { nickname: string; discriminator: string }) => {
        setShowOnboarding(false);
        const newProfile = {
            nickname: data.nickname,
            discriminator: data.discriminator
        };
        setUserProfile(newProfile);

        // Save to localStorage
        if (auth.currentUser) {
            localStorage.setItem(`user_profile_${auth.currentUser.uid}`, JSON.stringify(newProfile));
            updateUserStatus(auth.currentUser, 'online');
        }
    };

    const handleJoinSuccess = () => {
        console.log("Join success callback triggered");
        setHasJoinedTeam(true);

        setUserProfile(prev => {
            if (prev) {
                const updated = { ...prev, teamId: 'testing-team' };
                // Update localStorage
                if (auth.currentUser) {
                    localStorage.setItem(`user_profile_${auth.currentUser.uid}`, JSON.stringify(updated));
                }
                return updated;
            }
            return prev;
        });
    };

    const handleSignOut = async () => {
        try {
            await updateUserStatus(auth.currentUser!, 'offline');
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (checkingProfile) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading workspace...</div>;
    }

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>
            </div>
        );
    }

    return (
        <>
            {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

            {!showOnboarding && !hasJoinedTeam && (
                <div style={{ display: 'flex', height: '100vh' }}>
                    <JoinTeamSidebar onJoinSuccess={handleJoinSuccess} />
                    <WelcomeView />
                </div>
            )}

            {!showOnboarding && hasJoinedTeam && userProfile?.teamId && (
                <div style={{ display: 'flex', height: '100vh' }}>
                    {/* Header */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '60px',
                        backgroundColor: 'white',
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 1.5rem',
                        zIndex: 100
                    }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                            Mango Tree Technology
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', color: '#666' }}>
                                {userProfile.nickname}#{userProfile.discriminator}
                            </span>
                            <button
                                onClick={handleSignOut}
                                className="btn"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flex: 1, marginTop: '60px' }}>
                        {/* User List Sidebar */}
                        <UserList teamId={userProfile.teamId} />

                        {/* Chat Room */}
                        <div style={{ flex: 1 }}>
                            <ChatRoom teamId={userProfile.teamId} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WorkspaceLayout;
