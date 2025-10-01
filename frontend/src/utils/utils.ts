import { ErrorObject } from "../../../shared/interfaces/error-object";

export function redirectToError(error: ErrorObject): void {
  const data = error.context
    ? `&data=${encodeURIComponent(JSON.stringify(error.context))}`
    : "";

  window.location.href = `/error?text=${encodeURIComponent(error.error)}${data}`;
}
