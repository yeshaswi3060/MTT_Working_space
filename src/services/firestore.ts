import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc, doc, enableIndexedDbPersistence, where } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { app } from './firebase';

export const db = getFirestore(app);

try {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Persistence failed: Multiple tabs open');
        } else if (err.code == 'unimplemented') {
            console.warn('Persistence not supported by browser');
        }
    });
} catch (err) {
    console.warn('Error enabling persistence:', err);
}

export interface Message {
    id: string;
    text: string;
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    createdAt: any;
    teamId: string;
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    status: 'online' | 'offline';
    lastSeen: any;
    nickname?: string;
    discriminator?: string;
    teamId?: string;
}

export const sendMessage = async (text: string, user: User, teamId: string) => {
    if (!text.trim()) return;

    await addDoc(collection(db, 'messages'), {
        text,
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        photoURL: user.photoURL,
        teamId,
        createdAt: serverTimestamp()
    });
};

export const subscribeToMessages = (teamId: string, callback: (messages: Message[]) => void) => {
    const q = query(
        collection(db, 'messages'),
        where('teamId', '==', teamId),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Message));
        callback(messages);
    });
};

export const updateUserStatus = async (user: User, status: 'online' | 'offline') => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        email: user.email,
        photoURL: user.photoURL,
        status,
        lastSeen: serverTimestamp()
    }, { merge: true });
};

export const updateUserProfile = async (user: User, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userRef, {
            ...data,
            uid: user.uid, // Ensure UID is always present
            email: user.email,
            photoURL: user.photoURL,
            lastSeen: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("updateUserProfile error:", error);
        throw error;
    }
};

export const subscribeToUsers = (teamId: string, callback: (users: UserProfile[]) => void) => {
    // Filter by teamId. We remove orderBy('status') to avoid needing a composite index for now.
    // We can sort client-side if needed.
    const q = query(
        collection(db, 'users'),
        where('teamId', '==', teamId),
        orderBy('displayName', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data() as UserProfile);
        callback(users);
    });
};
