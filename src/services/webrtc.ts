import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};

export class WebRTCService {
    pc: RTCPeerConnection;
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;

    constructor() {
        this.pc = new RTCPeerConnection(servers);
    }

    async startLocalStream(video: boolean = true, audio: boolean = true) {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
        this.localStream.getTracks().forEach((track) => {
            this.pc.addTrack(track, this.localStream!);
        });
        return this.localStream;
    }

    async createCall(calleeId: string) {
        const callDoc = doc(collection(db, 'calls'));
        const offerCandidates = collection(callDoc, 'offerCandidates');
        const answerCandidates = collection(callDoc, 'answerCandidates');

        this.pc.onicecandidate = (event) => {
            event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
        };

        const offerDescription = await this.pc.createOffer();
        await this.pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await setDoc(callDoc, { callId: callDoc.id, offer, calleeId, status: 'offering' });

        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (!this.pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                this.pc.setRemoteDescription(answerDescription);
            }
        });

        onSnapshot(answerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    this.pc.addIceCandidate(candidate);
                }
            });
        });

        return callDoc.id;
    }

    async answerCall(callId: string) {
        const callDoc = doc(db, 'calls', callId);
        const answerCandidates = collection(callDoc, 'answerCandidates');
        const offerCandidates = collection(callDoc, 'offerCandidates');

        this.pc.onicecandidate = (event) => {
            event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
        };

        const callData = (await getDoc(callDoc)).data();
        const offerDescription = callData?.offer;
        await this.pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };

        await updateDoc(callDoc, { answer, status: 'answered' });

        onSnapshot(offerCandidates, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    this.pc.addIceCandidate(candidate);
                }
            });
        });
    }

    async startScreenShare() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const videoTrack = screenStream.getVideoTracks()[0];

            const sender = this.pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }

            videoTrack.onended = () => {
                // Revert to camera if screen share stops
                if (this.localStream) {
                    const cameraTrack = this.localStream.getVideoTracks()[0];
                    if (sender) sender.replaceTrack(cameraTrack);
                }
            };

            return screenStream;
        } catch (err) {
            console.error("Error sharing screen:", err);
            return null;
        }
    }

    close() {
        this.pc.close();
        this.localStream?.getTracks().forEach(t => t.stop());
    }
}
