import { isErrorObject } from "@shared/interfaces/error-object";

export function redirectToError(error: object): void {
  let text: string;
  let data = "";
  if (isErrorObject(error)) {
    text = error.error;
    data = error.context
      ? `&data=${encodeURIComponent(JSON.stringify(error.context))}`
      : "";
  } else if (typeof error == "object") text = JSON.stringify(error);
  else text = error as string;

  window.location.href = `/error?text=${encodeURIComponent(text)}${data}`;
}

export const isAbortError = (err: any): boolean => err.name === "AbortError";
