// components/Notifications.jsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../../services/api";

const socket = io("http://localhost:5000"); // backend URL

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [newCount, setNewCount] = useState(0);

  // Fetch past notifications from DB
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/notifications"); // seller's notifications
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  // Listen for live notifications
  useEffect(() => {
    if (!userId) return;

    socket.emit("register", userId); // join seller room

    socket.on("add-notification","remove-", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setNewCount((prev) => prev + 1);
    });

    socket.on("remove-notification", (notif) => {
      setNotifications((prev) => prev.filter((n) => n._id !== notif._id));
      setNewCount((prev) => prev - 1);
    });

    return () => {
      socket.off("add-notification");
      socket.off("remove-notification");
    };
  }, [userId]);

  return (
    <div className="relative">
      {newCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {newCount}
        </span>
      )}

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No new notifications at this moment.</p>
      ) : (
        <div className="max-h-40 overflow-y-auto">
          <ul className="text-gray-600 text-sm list-disc pl-4 space-y-1">
            {notifications.map((n) => (
              <li key={n._id} className="p-1 border-b border-gray-100">
                {n.message}{" "}
                <span className="text-gray-400 text-xs">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
