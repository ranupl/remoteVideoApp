import React, {useState, useCallback, useEffect} from "react";
import {useSocket} from '../context/SocketProvider';
import { useNavigate }  from "react-router-dom";

const LobbyScreen = () => {
    const Navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const socket = useSocket();

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join', {email, room});
    }, [email, room, socket])

const handleJoinRoom = useCallback((data) => {
    const { email, room } = data;
    console.log(email, room);
    Navigate(`/room/${room}`);
}, [Navigate])

useEffect(() => {
    socket.on('room:join', handleJoinRoom);
    }, [socket, handleJoinRoom]);
    
    return (
        <div>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="email">Email ID</label>
                <input type="email" id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
                <br />
                <label htmlFor="room">Room Number</label>
                <input type="text" id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}></input>
                <br />
                <button type="submit">Join</button>
            </form>
        </div>
    )
}

export default LobbyScreen;