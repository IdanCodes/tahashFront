import { ResponseCode } from "@shared/types/response-code";
import {
  ApiResponse,
  errorResponse,
  isApiResponse,
} from "@shared/types/api-response";
import { errorObject } from "@shared/interfaces/error-object";
import { isAbortError } from "../errorUtils";

const basePath = "/api";

/**
 * A global set to store all active AbortControllers
 */
const activeAbortControllers = new Set<AbortController>();

export function abortAllActiveRequests() {
  console.log(`Aborting ${activeAbortControllers.size} requests...`);
  for (const controller of activeAbortControllers) controller.abort();

  activeAbortControllers.clear();
}

/**
 * Send a GET request to the API
 * @param path The request's path
 * @param headers
 * @returns A ApiResponse that matches the response from the server
 */
export async function sendGetRequest(path: string, headers: HeadersInit = {}) {
  const abortController = new AbortController();
  activeAbortControllers.add(abortController);

  try {
    const res = await fetch(basePath + path, {
      credentials: "include",
      headers,
      signal: abortController.signal,
    });

    if (!res.ok)
      return new ApiResponse(
        ResponseCode.Error,
        `Request Error - Bad Response ${res.status}`,
      );

    const apiRes = await res.json();
    if (!isApiResponse(apiRes)) return errorResponse("Invalid Server Response");

    return apiRes;
  } catch (err: any) {
    if (isAbortError(err)) {
      console.log(`GET request to ${path} aborted`);
      return new ApiResponse(ResponseCode.Error, "Request Aborted");
    }
    console.error(`Network error (GET to ${path}):`, err);
    return new ApiResponse(
      ResponseCode.Error,
      errorObject(`Network Error (GET to ${path})`, err),
    );
  } finally {
    activeAbortControllers.delete(abortController);
  }
}

/**
 * Send a POST request to the API
 * @param path The request's path (Not including /api)
 * @param headers Headers to add to the request
 * @param body The body to send
 */
export async function sendPostRequest(
  path: string,
  body: object,
  headers: HeadersInit = {},
): Promise<ApiResponse> {
  const abortController = new AbortController();
  activeAbortControllers.add(abortController);

  try {
    const res = await fetch(basePath + path, {
      method: "post",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
      signal: abortController.signal,
    });

    if (!res.ok)
      return new ApiResponse(
        ResponseCode.Error,
        `Request Error - Bad Response ${res.status}`,
      );

    const apiRes = await res.json();
    if (!isApiResponse(apiRes)) return errorResponse("Invalid Server Response");

    return apiRes;
  } catch (err) {
    if (isAbortError(err)) {
      console.log(`POST request to ${path} aborted`);
      return new ApiResponse(ResponseCode.Error, "Request Aborted");
    }

    console.error(`Network error (POST to ${path}):`, err);
    return errorResponse("Network Error");
  } finally {
    activeAbortControllers.delete(abortController);
  }
}
