// src/components/Loading.jsx
import { Home, Building, MapPinHouseIcon, User, Warehouse } from "lucide-react";
import { useState, useEffect } from "react";

const icons = [
  { Icon: Home, color: "text-green-600" },
  { Icon: Building, color: "text-blue-600" },
  { Icon: MapPinHouseIcon, color: "text-red-600" },
  { Icon: User, color: "text-purple-600" },
  { Icon: Warehouse, color: "text-yellow-600" },
];

const Loading = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % icons.length);
    }, 1000); // change icon every 1s
    return () => clearInterval(interval);
  }, []);

  const { Icon, color } = icons[index];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100">
      <div className={`animate-bounce ${color}`}>
        <Icon size={64} />
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">
        Finding your perfect property...
      </p>
    </div>
  );
};

export default Loading;
