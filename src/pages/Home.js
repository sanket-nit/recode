import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const reactNavigator = useNavigate();

    // States
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");

    // Creates new room id
    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success("Created a new room");
    };

    // Validate and redirect to editor
    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error("ROOM ID & USERNAME is required");
            return;
        }

        // Redirect to editor page with username passed
        reactNavigator(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputKey = (e) => {
        if (e.keyCode === 13) {
            joinRoom();
        }
    };

    return (
        <div className="homepageWrapper">
            <div className="formWrapper">
                <img className="homepageLogo" src="" alt="" />
                <h4 className="mainLabel">Paste invitation code below!</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        onKeyUp={handleInputKey}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyUp={handleInputKey}
                    />
                    <button onClick={joinRoom} className="btn joinBtn">
                        Join
                    </button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href=""
                            className="createNewBtn"
                        >
                            new room
                        </a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>
                    Built with 🤍 by{" "}
                    <a href="https://github.com/sanket-nit/">Sanket</a>
                </h4>
            </footer>
        </div>
    );
};

export default Home;
