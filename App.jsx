import SMSSimulation from "./pages/SMSSimulation";
import WhatsAppBot from "./pages/WhatsAppBot";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";
import CrisisMap from "./pages/CrisisMap";
import AIPrediction from "./pages/AIPrediction";

const PrivateRoute = ({ children, role }) => {
  const { user, userData } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && userData?.role !== role) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user, userData } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={
          userData?.role === "admin" ? "/admin" :
          userData?.role === "volunteer" ? "/volunteer" : "/user"
        } />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/user" element={
          <PrivateRoute role="user"><UserDashboard /></PrivateRoute>
        } />
        <Route path="/volunteer" element={
          <PrivateRoute role="volunteer"><VolunteerDashboard /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute role="admin"><AdminPanel /></PrivateRoute>
        } />
        <Route path="/map" element={<CrisisMap />} />
        <Route path="/predict" element={<AIPrediction />} />
        <Route path="/whatsapp" element={<WhatsAppBot />} />
        <Route path="/sms" element={<SMSSimulation />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;