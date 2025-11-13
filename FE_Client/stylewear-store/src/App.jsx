import { RouterProvider } from "react-router-dom";
import clientRoutes from "./routes/ClientRoute";

function App() {
  return <RouterProvider router={clientRoutes} />;
}

export default App;
