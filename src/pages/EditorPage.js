import React, { useEffect, useRef, useState } from "react";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

const EditorPage = () => {
    // Initialisation
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const { roomId } = useParams();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();

            // Handle errors
            socketRef.current.on("connect_error", (err) => handleErrors(err));

            socketRef.current.on("connect_failed", (err) => handleErrors(err));

            const handleErrors = (e) => {
                console.log("Socket Error", e);
                toast.error("Socket connection failed! Try again later.");
                reactNavigator("/");
            };

            // Emit join event
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                // Location hook of router is used to retrieve the state passed through url
                username: location.state?.username,
                // Here ? is used to throw error if username not found
            });

            // Listens for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                    }
                    setClients(clients);

                    // Sync code
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        socketId,
                        code: codeRef.current,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        // cleaning function - clear listeners
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    if (!location.state) {
        <Navigate to="/" />;
    }

    // Using inbuilt navigator api of browser to copy room id
    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success("ROOM ID copied to clipboard.");
        } catch (error) {
            toast.error("Could not copy ROOM ID");
            console.log(error);
        }
    };

    // Leave Room
    const leaveRoom = () => {
        reactNavigator("/");
    };

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img src="" alt="" className="logoImage" />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button onClick={copyRoomId} className="btn copyBtn">
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;
