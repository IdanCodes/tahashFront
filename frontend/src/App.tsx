import "./index.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { JSX } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Error from "./pages/Error";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import WcaAuthCallback from "./pages/WcaAuthCallback";
import { UserInfoProvider } from "./context/UserContext";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingWrapper from "./components/LoadingWrapper";
import { AnimatePresence } from "motion/react";
import { PageTransition } from "./components/PageTransition";
import Scrambles from "./pages/Scrambles";
import { RoutePath } from "@shared/constants/route-path";

function AnimatedRoutes(): JSX.Element {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path={RoutePath.Page.HomeRedirect}
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.Error}
          element={
            <PageTransition>
              <Error />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.Login}
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.Profile}
          element={
            <PageTransition>
              <Profile />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.Scrambles}
          element={
            <PageTransition>
              <Scrambles />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.WcaAuthCallback}
          element={
            <PageTransition>
              <WcaAuthCallback />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="h-full bg-gray-300/90">
        <LoadingProvider>
          <UserInfoProvider>
            <Header />
            <LoadingWrapper>
              <AnimatedRoutes />
            </LoadingWrapper>
          </UserInfoProvider>
        </LoadingProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
