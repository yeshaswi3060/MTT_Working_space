import React, { useState } from 'react';
import { auth, googleProvider } from '../../../services/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Auth state listener in App or parent will handle redirect/state update
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            setError(err.message || 'Failed to login with Google');
        }
    };

    return (
        <div className="auth-form">
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>
            {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleLogin}>
                <div className="input-group">
                    <label className="input-label" htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="input-label" htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>OR</div>
            <button onClick={handleGoogleLogin} className="btn btn-outline" style={{ width: '100%' }}>
                Sign in with Google
            </button>
        </div>
    );
};

export default LoginForm;
