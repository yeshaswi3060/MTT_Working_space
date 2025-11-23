import { useEffect, useState } from 'react';
import AuthPage from './features/auth/components/AuthPage';
import WorkspaceLayout from './features/workspace/components/WorkspaceLayout';
import { auth } from './services/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { CallProvider } from './context/CallContext';
import CallModal from './features/call/components/CallModal';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                Loading...
            </div>
        );
    }

    if (user) {
        return (
            <CallProvider>
                <WorkspaceLayout />
                <CallModal />
            </CallProvider>
        );
    }

    return <AuthPage />;
}

export default App;
