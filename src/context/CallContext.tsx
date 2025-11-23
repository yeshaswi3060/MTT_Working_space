import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { WebRTCService } from '../services/webrtc';
import { auth } from '../services/firebase';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';

interface CallContextType {
    isCalling: boolean;
    incomingCall: any;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    startCall: (calleeId: string) => Promise<void>;
    answerCall: () => Promise<void>;
    endCall: () => void;
    shareScreen: () => Promise<void>;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within a CallProvider');
    return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const webrtcRef = useRef<WebRTCService | null>(null);

    useEffect(() => {
        if (!auth.currentUser) return;

        const db = getFirestore();
        const q = query(
            collection(db, 'calls'),
            where('calleeId', '==', auth.currentUser.uid),
            where('status', '==', 'offering')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    setIncomingCall({ id: change.doc.id, ...change.doc.data() });
                }
            });
        });

        return () => unsubscribe();
    }, []);

    const initializeWebRTC = async () => {
        const webrtc = new WebRTCService();
        webrtcRef.current = webrtc;
        const stream = await webrtc.startLocalStream();
        setLocalStream(stream);

        webrtc.pc.ontrack = (event) => {
            event.streams[0] && setRemoteStream(event.streams[0]);
        };

        return webrtc;
    };

    const startCall = async (calleeId: string) => {
        setIsCalling(true);
        const webrtc = await initializeWebRTC();
        await webrtc.createCall(calleeId);
    };

    const answerCall = async () => {
        if (!incomingCall) return;
        setIsCalling(true);
        const webrtc = await initializeWebRTC();
        await webrtc.answerCall(incomingCall.id);
        setIncomingCall(null);
    };

    const endCall = () => {
        webrtcRef.current?.close();
        webrtcRef.current = null;
        setIsCalling(false);
        setIncomingCall(null);
        setLocalStream(null);
        setRemoteStream(null);
        // Ideally update call status in Firestore to 'ended'
    };

    const shareScreen = async () => {
        if (webrtcRef.current) {
            const stream = await webrtcRef.current.startScreenShare();
            if (stream) setLocalStream(stream);
        }
    };

    return (
        <CallContext.Provider value={{ isCalling, incomingCall, localStream, remoteStream, startCall, answerCall, endCall, shareScreen }}>
            {children}
        </CallContext.Provider>
    );
};
