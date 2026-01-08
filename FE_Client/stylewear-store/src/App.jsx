import { RouterProvider } from "react-router-dom";
import clientRoutes from "./routes/ClientRoute";
import { AppProvider } from "./context/AppContext";

function App() {
    return (
        <AppProvider>
            <RouterProvider router={clientRoutes} />
        </AppProvider>
    );
}

export default App;
