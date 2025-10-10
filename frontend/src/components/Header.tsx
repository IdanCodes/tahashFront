import React, { JSX } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useUserInfo } from "../context/UserContext";

function Header(): JSX.Element {
  const userInfo = useUserInfo();

  return (
    <div className="mb-2 border-b-4 bg-blue-700 p-4 text-black">
      <h1 className="mb-3 text-center text-4xl font-bold">
        Tahash - ILCubers Weekly Comp
      </h1>
      <nav className="flex items-center justify-between">
        <div className="flex gap-5">
          <NavbarButton to="/" text="Home" />
          {userInfo.user ? <LoggedInButtons /> : <LoggedOutButtons />}
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
          isActive && "bg-gray-500 font-semibold",
          !isActive && "bg-gray-200 hover:scale-107 hover:bg-gray-400",
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
