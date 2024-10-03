import "./Avatar.css";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { createAvatarSynthesizer, createWebRTCConnection } from "./Utility";
import { avatarAppConfig } from "./config";
import { useCallback, useEffect, useState, useRef } from "react";

export const Avatar = ({ value }) => {
    const [avatarSynthesizer, setAvatarSynthesizer] = useState(null);
    const myAvatarVideoEleRef = useRef();
    const myAvatarAudioEleRef = useRef();
    const [mySpeechText, setMySpeechText] = useState(value ?? "");
    const iceUrl = avatarAppConfig.iceUrl;
    const iceUsername = avatarAppConfig.iceUsername;
    const iceCredential = avatarAppConfig.iceCredential;



    
    useEffect(() => {
        if (value) {
            speakSelectedText(value);
        }
    }, [value]);

    const handleOnTrack = (event) => {
        console.log("#### Printing handle onTrack ", event);
        if (event.track.kind === 'video') {
            const mediaPlayer = myAvatarVideoEleRef.current;
            mediaPlayer.srcObject = event.streams[0];
            mediaPlayer.autoplay = true;
            mediaPlayer.playsInline = true;
        } else {
            const audioPlayer = myAvatarAudioEleRef.current;
            audioPlayer.srcObject = event.streams[0];
            audioPlayer.autoplay = true;
            audioPlayer.muted = true;
        }
    };

    const stopSpeaking = () => {
        avatarSynthesizer.stopSpeakingAsync().then(() => {
            console.log("Stop speaking request sent.");
        }).catch((error) => {
            console.error("Error stopping speech:", error);
        });
    };

    const startSpeaking = () => {
        if (avatarSynthesizer) {
            speakSelectedText(mySpeechText);
        }
    };

    const speakSelectedText = (text) => {
        if (avatarSynthesizer && text) {
            text = String(text);
            const audioPlayer = myAvatarAudioEleRef.current;
            audioPlayer.muted = false;
            avatarSynthesizer.speakTextAsync(text).then((result) => {
                if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                    console.log("Speech synthesis completed.");
                }
            }).catch((error) => {
                console.error("Error during speech synthesis:", error);
            });
        }
    };

    const startSession = () => {
        let peerConnection = createWebRTCConnection(iceUrl, iceUsername, iceCredential);
        peerConnection.ontrack = handleOnTrack;
        peerConnection.addTransceiver('video', { direction: 'sendrecv' });
        peerConnection.addTransceiver('audio', { direction: 'sendrecv' });
        
        let avatarSynthesizer = createAvatarSynthesizer();
        setAvatarSynthesizer(avatarSynthesizer);

        avatarSynthesizer.startAvatarAsync(peerConnection).then(() => {
            console.log("Avatar started.");
        }).catch((error) => {
            console.error("Failed to start avatar:", error);
        });
    };

    useEffect(() => {
        startSession();
    }, []);

    return (
        <div className="myAvatarContainer">
            <div className="myAvatarVideoRootDiv">
                <video className="myAvatarVideoElement" ref={myAvatarVideoEleRef}></video>
                <audio ref={myAvatarAudioEleRef}></audio>
            </div>
            <button onClick={startSpeaking}>Start</button>
            <button onClick={stopSpeaking}>Stop</button>
        </div>
    );
};
