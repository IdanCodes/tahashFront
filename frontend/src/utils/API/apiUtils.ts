import { ResponseCode } from "@shared/types/response-code";
import {
  ApiResponse,
  errorResponse,
  isApiResponse,
} from "@shared/types/api-response";
import { errorObject } from "@shared/interfaces/error-object";

// const basePath = import.meta.env.PROD ? "/api" : `http://localhost:3000/api`;
const basePath = "/api";

/**
 * Send a GET request to the API
 * @param path The request's path
 * @returns A ApiResponse that matches the response from the server
 */
export async function sendGetRequest(path: string) {
  try {
    const res = await fetch(basePath + path, {
      credentials: "include",
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
    console.error(`Network error (GET to ${path}):`, err);
    return new ApiResponse(
      ResponseCode.Error,
      errorObject(`Network Error (GET to ${path})`, err),
    );
  }
}

/**
 * Send a POST request to the API
 * @param path The request's path (Not including /api)
 * @param body The body to send
 */
export async function sendPostRequest(
  path: string,
  body: object,
): Promise<ApiResponse> {
  try {
    const res = await fetch(basePath + path, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
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
    console.error(`Network error (POST to ${path}):`, err);
    return errorResponse("Network Error");
  }
}

// TODO: a method to create a post request's body
// export function getPostBody(headers: object) {}
