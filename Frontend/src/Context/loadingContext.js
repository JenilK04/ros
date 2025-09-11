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
      {loading && <Loading />} {/* Global loader overlay */}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

// 🔹 Getter for axios interceptors
export const getLoading = () => loadingControl;
