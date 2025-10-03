import React, { useEffect, useState } from "react";
import { useUser } from "../../Context/userContext";
import API from "../../services/api";
import ChatPopup from "./chatPopup";
import { io } from "socket.io-client";
import Navbar from "./navbar";
import { Trash2 } from "lucide-react";

const SOCKET_URL = "http://localhost:5000"; // backend URL

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

  // Fetch leads from API (includes property name now)
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

  // Socket messages
  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit("joinRoom", user._id);

    socket.on("receiveMessage", (msg) => {
      setLeads((prevLeads) => {
        const existingIndex = prevLeads.findIndex(
          (lead) =>
            lead.propertyId === msg.propertyId && lead.userId === msg.senderId
        );

        if (existingIndex !== -1) {
          const updated = [...prevLeads];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: msg.text,
            lastTime: msg.timestamp || new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prevLeads,
            {
              propertyId: msg.propertyId,
              userId: msg.senderId,
              name: msg.senderName || "Unknown",
              property: msg.property || "Unknown Property",
              lastMessage: msg.text,
              lastTime: msg.timestamp || new Date().toISOString(),
            },
          ];
        }
      });

      if (openChat && msg.propertyId === openChat.propertyId) {
        setOpenChat((prev) => ({ ...prev }));
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, user, openChat]);

  // Delete lead
  const handleDeleteLead = async (lead) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/myleads/${lead.propertyId}/${lead.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLeads((prev) =>
        prev.filter(
          (l) =>
            !(l.propertyId === lead.propertyId && l.userId === lead.userId)
        )
      );

      if (
        openChat &&
        openChat.propertyId === lead.propertyId &&
        openChat.userId === lead.userId
      ) {
        setOpenChat(null);
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

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
                className="p-3 border rounded-md bg-white shadow cursor-pointer hover:bg-gray-50 flex justify-between items-center"
              >
                <div
                  onClick={() => setOpenChat(lead)}
                  className="flex flex-col flex-grow"
                >
                  <div className="font-semibold">Chat with {lead.name}</div>
                  <div className="text-blue-600 text-xs italic">
                    About: {lead.property}
                  </div>
                  <div className="text-gray-600 text-sm">{lead.lastMessage}</div>
                  <div className="text-gray-400 text-xs">
                    {new Date(lead.lastTime).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLead(lead);
                  }}
                  className="text-red-500 text-sm font-semibold ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {openChat && socket && (
          <ChatPopup
            property={{
              _id: openChat.propertyId,
              contactName: openChat.name,
              propertyName: openChat.property, // comes from API
            }}
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
