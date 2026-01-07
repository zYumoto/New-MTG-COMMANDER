import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AnimatedRoutes from "./routes/AnimatedRoutes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
