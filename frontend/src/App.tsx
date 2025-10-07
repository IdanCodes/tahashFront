import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { JSX } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Error from "./pages/Error";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import WcaAuthCallback from "./pages/WcaAuthCallback";
import { UserInfoProvider } from "./context/UserContext";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="h-full bg-gray-300/90">
        <UserInfoProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/error" element={<Error />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wca-auth-callback" element={<WcaAuthCallback />} />
          </Routes>
        </UserInfoProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
