import {ResponseCode} from "../../types/response-code";
import {ApiResponse, isApiResponse} from "../../types/api-response";

const basePath = "http://localhost:4000/api";

/**
 * Send a GET request to the API
 * @param path The request's path
 * @returns A ApiResponse that matches the response from the server
 */
export async function sendGetRequest(path: string) {
  try {
    const res = await fetch(basePath + path);

    if (!res.ok)
      return new ApiResponse(
        ResponseCode.Error,
        `Request Error - Bad Response ${res.status}`,
      );

    const apiRes = await res.json();
    if (!isApiResponse(apiRes))
      return new ApiResponse(ResponseCode.Error, "Invalid Server Response");

    return apiRes;
  } catch (err) {
    console.error(`Network error (GET to ${path}):`, err);
    return new ApiResponse(ResponseCode.Error, "Network Error");
  }
}

/**
 * Send a POST request to the API
 * @param path The request's path
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
      body: JSON.stringify(body),
    });

    if (!res.ok)
      return new ApiResponse(
        ResponseCode.Error,
        `Request Error - Bad Response ${res.status}`,
      );

    const apiRes = await res.json();
    if (!isApiResponse(apiRes))
      return new ApiResponse(ResponseCode.Error, "Invalid Server Response");

    return apiRes;
  } catch (err) {
    console.error(`Network error (POST to ${path}):`, err);
    return new ApiResponse(ResponseCode.Error, "Network Error");
  }
}

// TODO:
export function getPostBody(headers: object) {}
