import { ErrorObject, isErrorObject } from "@shared/interfaces/error-object";

export function redirectToError(error: object): void {
  let text: string;
  let data = "";
  if (isErrorObject(error)) {
    text = error.error;
    data = error.context
      ? `&data=${encodeURIComponent(JSON.stringify(error.context))}`
      : "";
  } else text = error.toString();

  window.location.href = `/error?text=${encodeURIComponent(text)}${data}`;
}
