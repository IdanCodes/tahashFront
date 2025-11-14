import React, { JSX, MouseEventHandler } from "react";
import clsx from "clsx";
import { ButtonSize } from "./ButtonSize";

export default function PrimaryButton({
  text = "",
  onClick = () => {},
  disabled = false,
  buttonSize = ButtonSize.Medium,
  className = "",
  btnType = "button",
  colors = {
    normal: "bg-slate-100/70",
    hover: "bg-gray-500/90",
    click: "bg-gray-600/90",
  },
}: {
  text?: string | number;
  children?: React.ReactNode;
  onClick?: MouseEventHandler;
  disabled?: boolean;
  buttonSize?: ButtonSize;
  btnType?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  colors?: { normal: string; hover: string; click: string };
  className?: string;
}): JSX.Element {
  return (
    <>
      <button
        className={clsx(
          `box-border flex scale-95 items-center justify-center rounded-2xl px-5 py-3 shadow-xl transition-transform duration-[400ms] [transition-timing-function:cubic-bezier(0.68,-0.55,0.27,2.5)] select-none hover:scale-[1.05] ${colors.normal}`,
          disabled && "cursor-not-allowed opacity-70",
          !disabled &&
            `cursor-pointer hover:scale-100 hover:${colors.hover} active:${colors.click}`,
          className,
        )}
        type={btnType}
        disabled={disabled}
        onClick={(e) => {
          if (!disabled) onClick(e);
        }}
      >
        <p
          className={clsx(
            "font-[Arial] font-bold",
            buttonSize == ButtonSize.Small && "text-2xl",
            buttonSize == ButtonSize.Medium && "m-0.5 text-3xl",
            buttonSize == ButtonSize.Large && "m-1 text-4xl",
          )}
        >
          {text}
        </p>
      </button>
    </>
  );
}
