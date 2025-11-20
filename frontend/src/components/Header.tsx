import React, { JSX } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useUserInfo } from "../context/UserContext";
import logo from "./assets/ILSpeeddcubinglogo.svg";
import "./animations.css";
import { RoutePath } from "@shared/constants/route-path";
import { useActiveComp } from "../context/ActiveCompContext";

function Header(): JSX.Element {
  const userInfo = useUserInfo();
  const compInfo = useActiveComp();

  return (
    <div className="flex h-auto w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800 p-4 lg:h-[90px] lg:flex-row-reverse lg:justify-between lg:gap-0 lg:p-[1vw]">
      <div className="group relative flex flex-col items-center pb-[0.3vw]">
        <div className="flex flex-row items-center gap-3 lg:items-center lg:gap-5">
          <img
            src={logo}
            alt="ILCubers Logo"
            className="w-[45px] transition-transform duration-200 ease-in-out group-hover:scale-110 lg:w-[55px]"
          />
          <h1 className="group-hover:animate-wave inline-block text-[clamp(1.2rem,2vw,2.5rem)] tracking-[0.03em] whitespace-nowrap text-blue-100 transition-all duration-200 ease-in-out select-none group-hover:scale-102">
            ILCubers - Weekly Competition
          </h1>
        </div>
        {compInfo.displayInfo && (
          <p className="absolute bottom-[-8px] text-[clamp(0.75rem,1vw,1.1rem)] text-white transition-all duration-200 group-hover:scale-105 group-hover:text-yellow-400">
            Comp #{compInfo.displayInfo.compNumber}
          </p>
        )}
      </div>

      <nav className="pr-[2vw] max-lg:pr-0 lg:p-[2vw]">
        <ul className="flex list-none gap-5 text-center font-extrabold text-blue-100">
          <li>
            <NavbarButton to="/" text="Home" />
          </li>
          {userInfo.isLoggedIn ? <LoggedInLinks /> : <LoggedOutLinks />}
          <li>
            <NavbarButton to={RoutePath.Page.Results} text="Results" />
          </li>
          {userInfo.isAdmin ? <AdminLinks /> : <></>}
        </ul>
      </nav>
    </div>
  );
}

function LoggedInLinks() {
  return (
    <>
      <li>
        <NavbarButton to="/profile" text="Profile" />
      </li>
      <li>
        <NavbarButton to="/scrambles" text="Scrambles" />
      </li>
    </>
  );
}

function LoggedOutLinks() {
  return (
    <li>
      <NavbarButton to="/login" text="Login" />
    </li>
  );
}

function AdminLinks() {
  return (
    <li>
      <NavbarButton to={"/admin-panel"} text={"Admin Panel"} />
    </li>
  );
}

function NavbarButton({ to, text }: { to: string; text: string }): JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "relative px-[10px] text-[clamp(1.2rem,1vw,1.4rem)] transition-transform duration-300 ease-in-out max-lg:text-[clamp(0.8rem,1vw,1.9rem)]",
          isActive
            ? "scale-105 text-blue-100"
            : "text-blue-100 hover:scale-110",
        )
      }
    >
      <span className="underline-hover">{text}</span>
    </NavLink>
  );
}

export default Header;
