import "./index.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { JSX, useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Error from "./pages/Error";
import LoginButton from "./components/LoginButton";
import Profile from "./pages/Profile";
import WcaAuthCallback from "./pages/WcaAuthCallback";
import { UserInfoProvider } from "./context/UserContext";
import { LoadingProvider, useLoadingEraser } from "./context/LoadingContext";
import LoadingWrapper from "./components/LoadingWrapper";
import { AnimatePresence } from "motion/react";
import { PageTransition } from "./components/PageTransition";
import Scrambles from "./pages/Scrambles";
import { RoutePath } from "@shared/constants/route-path";
import RequireAuth from "./components/RequireAuth";
import Compete from "./pages/Compete";
import { cancelPendingRequests } from "./utils/API/apiUtils";
import AdminPanel from "./pages/AdminPanel";
import NotFoundPage from "./pages/NotFoundPage";
import Results from "./pages/Results";
import { ActiveCompProvider } from "./context/ActiveCompContext";
import UserPage from "./pages/UserPage";
import InstructionsPage from "./pages/InstructionsPage";
import AboutPage from "./pages/AboutPage";
import YuvalPorat from "./pages/YuvalPorat";

function AnimatedRoutes(): JSX.Element {
  const location = useLocation();
  const { clearLoaders } = useLoadingEraser();

  useEffect(() => {
    cancelPendingRequests();
    clearLoaders();
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path={RoutePath.Page.Home}
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
          path={RoutePath.Page.WcaAuthCallback}
          element={
            <PageTransition>
              <WcaAuthCallback />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.Profile}
          element={
            <RequireAuth>
              <PageTransition>
                <Profile />
              </PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path={RoutePath.Page.Scrambles}
          element={
            <RequireAuth>
              <PageTransition>
                <Scrambles />
              </PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path={RoutePath.Page.CompeteEvent}
          element={
            <RequireAuth>
              <PageTransition>
                <Compete />
              </PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path={RoutePath.Page.AdminPanel}
          element={
            <RequireAuth>
              <PageTransition>
                <AdminPanel />
              </PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path={RoutePath.Page.AdminPanelEvent}
          element={
            <RequireAuth>
              <PageTransition>
                <AdminPanel />
              </PageTransition>
            </RequireAuth>
          }
        />
        <Route
          path={RoutePath.Page.Results}
          element={
            <PageTransition>
              <Results />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.ResultsEvent}
          element={
            <PageTransition>
              <Results />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.UserPage}
          element={
            <PageTransition>
              <UserPage />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.Instructions}
          element={
            <PageTransition>
              <InstructionsPage />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.YuvalPorat}
          element={
            <PageTransition>
              <YuvalPorat />
            </PageTransition>
          }
        />
        <Route
          path={RoutePath.Page.About}
          element={
            <PageTransition>
              <AboutPage />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFoundPage />
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
      <div className="min-h-screen bg-gradient-to-tl from-blue-700/90 via-blue-600/90 to-blue-600">
        <LoadingProvider>
          <ActiveCompProvider>
            <UserInfoProvider>
              <Header />
              <div className="align-start flex justify-center pb-2">
                <div className="min-h-[calc(100vh-5rem)] w-[90%] overflow-hidden rounded-b-2xl border border-t-0 border-white/20 bg-white/80 shadow-xl backdrop-blur-md">
                  <LoadingWrapper>
                    <AnimatedRoutes />
                  </LoadingWrapper>
                </div>
              </div>
            </UserInfoProvider>
          </ActiveCompProvider>
        </LoadingProvider>

        <div className="mx-auto w-fit py-2">
          <span
            className="mx-auto"
            style={{
              fontSize: "1.4rem",
              height: "2rem",
            }}
          >
            {"Made with ❤️ by Idan Sahar"}
          </span>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
