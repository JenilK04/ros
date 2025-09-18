import { Home, Building, MapPinHouseIcon, User, Warehouse } from "lucide-react";
import { useState, useEffect } from "react";

const icons = [
  { Icon: Home, color: "text-green-400" },
  { Icon: Building, color: "text-blue-400" },
  { Icon: MapPinHouseIcon, color: "text-red-400" },
  { Icon: User, color: "text-purple-400" },
  { Icon: Warehouse, color: "text-yellow-400" },
];

const Loading = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % icons.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { Icon, color } = icons[index];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-bounce ${color}`}>
        <Icon size={64} />
      </div>
      <p className="mt-4 text-lg font-semibold text-white animate-pulse">
        Finding your perfect property...
      </p>
    </div>
  );
};

export default Loading;
