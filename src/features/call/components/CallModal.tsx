import React, { useEffect, useRef } from 'react';
import { useCall } from '../../../context/CallContext';

const CallModal: React.FC = () => {
    const { isCalling, incomingCall, localStream, remoteStream, answerCall, endCall, shareScreen } = useCall();
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (incomingCall && !isCalling) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Incoming Call</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={answerCall} className="btn btn-primary" style={{ marginRight: '1rem' }}>Answer</button>
                        <button onClick={endCall} className="btn btn-outline" style={{ borderColor: 'red', color: 'red' }}>Decline</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isCalling) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#000', zIndex: 2000,
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Remote Video (Main) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />

                {/* Local Video (PIP) */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '200px',
                    height: '150px',
                    backgroundColor: '#333',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid white'
                }}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            <div style={{
                height: '80px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
            }}>
                <button onClick={shareScreen} className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
                    Share Screen
                </button>
                <button onClick={endCall} className="btn" style={{ backgroundColor: 'red', color: 'white' }}>
                    End Call
                </button>
            </div>
        </div>
    );
};

export default CallModal;
