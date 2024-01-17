import React, {useCallback, useEffect, useState} from "react";
import {useSocket } from "../context/SocketProvider"
import ReactPlayer from "react-player"
import  peer from "../service/peer"

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId , setRemoteSocketId] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [myStream, setMyStream] = useState(null);
   
    const handleUserJoined = useCallback(({email, id}) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, [])
     
    const handleIncommingCall = useCallback(async({from, offer}) => {
        setRemoteSocketId(from)
        const stream = await navigator.mediaDevices.getUserMedia({
            audio : true,
            video: true,
        });
        setMyStream(stream);
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', {to: from, ans})
    },[socket])

    // const sendStreams = useCallback(() => {
    //     for (const track of myStream.getTracks()) {
    //     peer.peer.addTrack(track, myStream);
    //     }
    // }, [myStream]);

    const sendStreams = useCallback(() => {
        if (peer.peer.signalingState !== 'closed') {
          for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
          }
        } else {
          console.warn("RTCPeerConnection is closed. Cannot add tracks.");
        }
      }, [myStream, peer]);
      

    const handleCallAccepted = useCallback(({from, ans}) => {
        peer.setLocalDescription(ans);
        console.log('Call acceptd!');
        sendStreams();
    }, [sendStreams])
 
    // const handleNegoNeeded = useCallback(async () => {
    //     const offer = await peer.getOffer();
    //     socket.emit('peer:nego:needed', {offer, to:remoteStream});
    // }, [])

    const handleNegoNeeded = useCallback(async () => {
        if (peer.peer.signalingState !== 'closed') {
          const offer = await peer.getOffer();
          socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
        } else {
          console.warn("RTCPeerConnection is closed. Cannot initiate negotiation.");
        }
      }, [socket, peer, remoteSocketId]);

    const handleNegoNeededFinal= useCallback(async({ans}) => {
    await peer.setLocalDescription(ans);
    },[])

    const handleNegoNeededIncomming = useCallback(async ({from, offer}) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', {to: from, ans});
    }, [socket])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded',handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded);
        }
    }, [handleNegoNeeded])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams;
            console.log("Go TRack");
            setRemoteStream(remoteStream[0]);
        })
    })

    useEffect(() => {
            socket.on('user:joined', handleUserJoined);
            socket.on('incoming:call', handleIncommingCall);
            socket.on('call:accepted', handleCallAccepted);
            socket.on('peer:nego:needed', handleNegoNeededIncomming);
            socket.on('peer:nego:final', handleNegoNeededFinal);
            return() => {
                socket.off('user:joined', handleUserJoined);
                socket.off('incoming:call', handleIncommingCall);
                socket.off('call:accepted', handleCallAccepted);
                socket.off('peer:nego:needed', handleNegoNeededIncomming);
                socket.off('peer:nego:final', handleNegoNeededFinal);
            }

        }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeededIncomming,handleNegoNeededFinal]);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio : true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", {to: remoteSocketId, offer})
        setMyStream(stream);
    }, [remoteSocketId, socket])

    return (
        <div><h1>Room Page</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room" }</h4>
        {myStream && <button onClick={sendStreams}>Send Stream</button>}
        {remoteSocketId && <button onClick={handleCallUser}>Call</button> }
        {myStream && (
        <div>
            <h3>My Stream</h3>
       <ReactPlayer playing muted height="200px" width="200px" url={myStream} />
       </div>)}
       {remoteStream && (
        <div>
            <h3>Remote Stream</h3>
       <ReactPlayer playing muted height="200px" width="200px" url={remoteStream} />
       </div>)}
        </div>
    )
}

export default RoomPage;
