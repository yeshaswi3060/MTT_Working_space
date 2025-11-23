import React from 'react';
import { auth } from '../../../services/firebase';

const WelcomeView: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#fff'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome, {auth.currentUser?.displayName?.split('#')[0]}!</h1>
            <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '500px' }}>
                You are now part of the MTT Working Space. To start collaborating with your colleagues, please join a team using the sidebar on the left.
            </p>
        </div>
    );
};

export default WelcomeView;
