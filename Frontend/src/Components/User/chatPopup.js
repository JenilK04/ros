import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import API from "../../services/api";

const ChatPopup = ({ property, buyerId, sellerId, onClose, socket, note }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const room = [buyerId, sellerId].sort().join("-");

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/chat/${property._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load chat:", err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [property._id]);

  // Socket listener
  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", room);

    socket.on("receiveMessage", (msg) => {
      if (msg.propertyId === property._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, property._id, room]);

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/chat/${property._id}`,
        { senderId: buyerId, text: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit message to socket (both sender + receiver)
      socket.emit("sendMessage", {
        ...res.data,
        propertyName: property.propertyName,
      });

      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white shadow-lg rounded-lg flex flex-col border z-50">
      {note && (
        <div className="bg-yellow-100 text-yellow-800 text-xs p-2 border-b">
          Note: {note}
        </div>
      )}
      {/* Header: Seller + Property */}
      <div className="flex justify-between items-center p-2 bg-blue-600 text-white rounded-t-lg">
        <div>
          <div className="font-semibold">{property.contactName}</div>
          <div className="text-xs italic">{property.propertyName}</div>
        </div>
        <button onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-2 overflow-y-auto max-h-64 space-y-2 text-sm">
        {messages.length > 0 ? (
          messages.map((msg, idx) => {
            const isSender = msg.senderId === buyerId;
            const senderName = isSender ? "You" : property.contactName;
            return (
              <div
                key={idx}
                className={`flex flex-col max-w-[75%] ${
                  isSender ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div
                  className={`p-2 rounded-md ${
                    isSender ? "bg-blue-100" : "bg-gray-200"
                  }`}
                >
                  <div className="font-semibold text-xs">{senderName}</div>
                  <div>{msg.text}</div>
                </div>
                <div className="text-gray-400 text-[10px] mt-0.5">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-400 text-xs">No messages yet</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex border-t p-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-1 text-sm outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-2 text-blue-600 font-semibold text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPopup;
