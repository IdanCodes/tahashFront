import React, { JSX } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useUserInfo } from "../context/UserContext";
import logo from "@assets/TahashLogo.png";
import "./animations.css";
import { RoutePath } from "@shared/constants/route-path";
import { useActiveComp } from "../context/ActiveCompContext";

function Header(): JSX.Element {
  const userInfo = useUserInfo();
  const compInfo = useActiveComp();

  return (
    <div className="flex h-auto w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800 p-4 xl:h-[90px] xl:flex-row-reverse xl:justify-between xl:gap-0 xl:p-[1vw]">
      <div className="group relative flex flex-col items-center pb-[0.3vw]">
        <div className="flex flex-row-reverse items-center xl:gap-2">
          <img
            src={logo}
            alt="ILCubers Logo"
            className="right-[-8px] w-[55px] transition-transform duration-200 ease-in-out group-hover:scale-103 xl:w-[80px]"
          />
          <div className="flex flex-col" dir="rtl">
            <p className="group-hover:animate-wave m-0 inline-block p-1 text-[clamp(1.2rem,2vw,2.2rem)] leading-none tracking-[0.03em] whitespace-nowrap text-blue-100 transition-all duration-200 ease-in-out select-none group-hover:scale-110">
              ILCubers
            </p>
            <p className="m-0 text-center text-[clamp(0.8rem,1.2vw,1.7rem)] leading-none text-blue-50 transition-all duration-200 group-hover:scale-105 group-hover:text-yellow-400">
              {compInfo.displayInfo &&
                `תחרות #` + `${compInfo.displayInfo.compNumber}`}
            </p>
          </div>
        </div>
      </div>

      <nav className="pr-[2vw] max-xl:pr-0 xl:p-[2vw]">
        <ul className="flex list-none gap-5 text-center font-bold text-blue-100 max-lg:flex-wrap max-lg:justify-center">
          <li>
            <NavbarButton to="/" text="Home" />
          </li>
          {userInfo.isLoggedIn ? <LoggedInLinks /> : <></>}
          <li>
            <NavbarButton to={RoutePath.Page.Results} text="Results" />
          </li>
          <li>
            <NavbarButton
              to={RoutePath.Page.Instructions}
              text="Instructions"
            />
          </li>
          <li>
            <NavbarButton to={RoutePath.Page.YuvalPorat} text="Yuval Porat" />
          </li>
          <li>
            <NavbarButton to={RoutePath.Page.About} text="About" />
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
          "relative px-[7px] text-center text-[clamp(1.1rem,1.4vw,1.4rem)] transition-transform duration-300 ease-in-out max-xl:text-[clamp(1rem,1.2vw,1.9rem)]",
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
