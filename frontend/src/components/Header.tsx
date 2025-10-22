import React, { JSX } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useUserInfo } from "../context/UserContext";
import logo from "./assets/ILSpeeddcubinglogo.png";
import "./animations.css";


function Header(): JSX.Element {
  const userInfo = useUserInfo();

  return (
    <div className="flex h-[100px] w-full items-center justify-between bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800">
      <div className="group flex items-center gap-5 pl-[1vw]">
        <img
          src={logo}
          alt="ILCubers Logo"
          className="w-[65px] transition-transform duration-200 ease-in-out group-hover:scale-110"
        />
        <h1 className="inline-block text-[clamp(1.5rem,2vw,2.5rem)] tracking-[0.03em] whitespace-nowrap text-blue-100 transition-all duration-200 ease-in-out select-none group-hover:tracking-[0.05em]">
          ILCubers - Weekly Competition
        </h1>
      </div>

      <nav className="pr-[2vw]">
        <ul className="flex list-none gap-5 text-center font-extrabold text-blue-100">
          <li>
            <NavbarButton to="/" text="Home" />
          </li>
          {userInfo.isLoggedIn ? (
            <>
              <li>
                <NavbarButton to="/profile" text="Profile" />
              </li>
              <li>
                <NavbarButton to="/scrambles" text="Scrambles" />
              </li>
            </>
          ) : (
            <li>
              <NavbarButton to="/login" text="Login" />
            </li>
          )}
        </ul>
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
          "relative px-[10px] text-[clamp(1.5rem,1vw,1.9rem)] transition-transform duration-300 ease-in-out",
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
