import { BrowserRouter } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AdminRoutes />
    </BrowserRouter>
  );
}