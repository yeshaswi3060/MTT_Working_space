import React, { useState } from 'react';
import { auth, googleProvider } from '../../../services/firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const SignUpForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Auth state listener in App or parent will handle redirect/state update
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            setError(err.message || 'Failed to sign up with Google');
        }
    };

    return (
        <div className="auth-form">
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Sign Up</h2>
            {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSignUp}>
                <div className="input-group">
                    <label className="input-label" htmlFor="signup-email">Email</label>
                    <input
                        id="signup-email"
                        type="email"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="input-label" htmlFor="signup-password">Password</label>
                    <input
                        id="signup-password"
                        type="password"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="input-label" htmlFor="signup-confirm-password">Confirm Password</label>
                    <input
                        id="signup-confirm-password"
                        type="password"
                        className="input-field"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
            <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>OR</div>
            <button onClick={handleGoogleSignUp} className="btn btn-outline" style={{ width: '100%' }}>
                Sign up with Google
            </button>
        </div>
    );
};

export default SignUpForm;
