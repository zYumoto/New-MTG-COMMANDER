// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Lobby from "./pages/Lobby";
import Profile from "./pages/Profile";
import DeckBuilder from "./pages/DeckBuilder";

import { AuthProvider, useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/lobby" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/lobby"
            element={
              <PrivateRoute>
                <Lobby />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/decks/new"
            element={
              <PrivateRoute>
                <DeckBuilder />
              </PrivateRoute>
            }
          />

          {/* rota raiz */}
          <Route path="/" element={<Navigate to="/lobby" replace />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/lobby" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
