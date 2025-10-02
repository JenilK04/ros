import React, { useEffect, useState } from "react";
import { useUser } from "../../Context/userContext";
import API from "../../services/api";
import ChatPopup from "./chatPopup";
import { io } from "socket.io-client";
import Navbar from "./navbar";

const SOCKET_URL = "http://localhost:5000"; // replace with your backend URL

const MyLeads = () => {
  const { user } = useUser();
  const [leads, setLeads] = useState([]);
  const [openChat, setOpenChat] = useState(null);
  const [socket, setSocket] = useState(null);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Fetch leads
  const fetchLeads = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/myleads/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leadData = Array.isArray(res.data) ? res.data : [];
      setLeads(leadData);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket || !user?._id) return;

    // Join a room for each lead (or for simplicity, join a personal room)
    socket.emit("joinRoom", user._id);

    socket.on("receiveMessage", (msg) => {
      // If new message belongs to a lead, update leads list
      fetchLeads();

      // If chat is open for this property, append the message
      if (openChat && msg.propertyId === openChat.propertyId) {
        setOpenChat((prev) => ({ ...prev })); // trigger re-render
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket, user, openChat]);

  return (
    <>
      <Navbar />
        <div className="p-4">
        <h2 className="text-xl font-bold mb-3">My Leads</h2>
        {leads.length === 0 ? (
            <p className="text-gray-500">No active chats yet.</p>
        ) : (
            <ul className="space-y-2">
            {leads.map((lead) => (
                <li
                key={lead.userId + lead.propertyId}
                onClick={() => setOpenChat(lead)}
                className="p-3 border rounded-md bg-white shadow cursor-pointer hover:bg-gray-50"
                >
                <div className="font-semibold">Chat with {lead.name}</div>
                <div className="text-gray-600 text-sm">{lead.lastMessage}</div>
                <div className="text-gray-400 text-xs">
                    {new Date(lead.lastTime).toLocaleString()}
                </div>
                </li>
            ))}
            </ul>
        )}

        {openChat && (
            <ChatPopup
            property={{ _id: openChat.propertyId, contactName: openChat.name }}
            buyerId={user._id}
            sellerId={openChat.userId}
            onClose={() => setOpenChat(null)}
            socket={socket}
            />
        )}
      </div>
    </>
  );
};

export default MyLeads;
