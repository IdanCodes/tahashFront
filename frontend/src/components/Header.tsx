import React, { JSX } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useUserInfo } from "../context/UserContext";
import logo from "./assets/ILSpeeddcubinglogo.png";

function Header(): JSX.Element {
  const userInfo = useUserInfo();

  return (
    <div className="flex h-[100px] w-full items-center justify-between bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800">
      <div className="group flex items-center gap-5 pl-[1vw]">
        <img
          src={logo}
          alt="ILCubers Logo"
          className="w-[65px] transition-transform duration-400 ease-in-out group-hover:scale-110"
        />
        <h1 className="inline-block text-[clamp(1.5rem,2vw,2.5rem)] whitespace-nowrap text-blue-100 transition-all duration-400 ease-in-out select-none group-hover:tracking-[0.05em]">
          ILCubers - Weekly Competition
        </h1>
      </div>
      <nav className="flex items-center justify-between">
        <div className="flex gap-5">
          <NavbarButton to="/" text="Home" />
          {userInfo.isLoggedIn ? <LoggedInButtons /> : <LoggedOutButtons />}
        </div>
      </nav>
    </div>
  );
}

function NavbarButton({ to, text }: { to: string; text: string }): JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "box-border rounded-xl border-3 border-black text-2xl transition-all duration-125 ease-out",
          isActive && "scale-109 bg-gray-500",
          !isActive && "bg-gray-200 hover:scale-105 hover:bg-gray-400",
        )
      }
    >
      <div className="box-border px-3 py-2">
        <p className="text-center text-black">{text}</p>
      </div>
    </NavLink>
  );
}

function LoggedInButtons(): JSX.Element {
  return (
    <>
      <NavbarButton to="/profile" text="Profile" />
      <NavbarButton to="/scrambles" text="Scrambles" />
    </>
  );
}

function LoggedOutButtons(): JSX.Element {
  return (
    <>
      <NavbarButton to="/login" text="Login" />
    </>
  );
}

export default Header;
