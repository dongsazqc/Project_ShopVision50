import { createContext, useContext, useState } from "react";
import api from "../utils/axios";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const userId = localStorage.getItem("userId");
    const [cartCount, setCartCount] = useState(0);

    const handleUpdateCartCount = async()=>{
         const res = await api.get(`/Cart/GetCartByUser/${userId}`);
            const rawItems = res.data?.cartItems || [];
            setCartCount(rawItems?.length);
    }

    return (
        <AppContext.Provider
            value={{
                cartCount,
                setCartCount,
                handleUpdateCartCount
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within AppProvider");
    return ctx;
};

export default AppContext;
