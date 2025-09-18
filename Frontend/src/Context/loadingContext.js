import { createContext, useContext, useState } from "react";
import Loading from "../Components/loading";

const LoadingContext = createContext();

// 🔹 Global reference for axios interceptors
let loadingControl = null;

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // Register globally
  loadingControl = { setLoading };

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      <div className="relative min-h-screen">
        {children}

        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Loading />
          </div>
        )}
      </div>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

// 🔹 Getter for axios interceptors
export const getLoading = () => loadingControl;
