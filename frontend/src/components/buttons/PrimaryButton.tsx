import React, { JSX, MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import { ButtonSize } from "./ButtonSize";

export default function PrimaryButton({
  text = "",
  onClick = () => {},
  disabled = false,
  buttonSize = ButtonSize.Medium,
  className = "",
  btnType = "button",
  colors = "bg-slate-100/70 hover:bg-slate-100/50 active:bg-slate-300/80",
}: {
  text?: string | number | JSX.Element;
  children?: React.ReactNode;
  onClick?: MouseEventHandler;
  disabled?: boolean;
  buttonSize?: ButtonSize;
  btnType?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  colors?: string | undefined;
  className?: string;
}): JSX.Element {
  return (
    <>
      <button
        className={clsx(
          `box-border flex scale-95 items-center justify-center rounded-2xl px-5 py-3 shadow-xl transition-transform duration-[200ms] [transition-timing-function:cubic-bezier(0.68,-0.55,0.3,2.5)] select-none`,
          disabled && "cursor-not-allowed opacity-70",
          !disabled && `cursor-pointer hover:scale-100 hover:scale-[1.03]`,
          colors,
          className,
        )}
        type={btnType}
        disabled={disabled}
        onClick={(e) => {
          if (!disabled) onClick(e);
        }}
      >
        <div
          className={clsx(
            "font-[Arial] font-bold",
            buttonSize == ButtonSize.Small && "text-2xl",
            buttonSize == ButtonSize.Medium && "m-0.5 text-3xl",
            buttonSize == ButtonSize.Large && "m-1 text-4xl",
          )}
        >
          <>{text}</>
        </div>
      </button>
    </>
  );
}
