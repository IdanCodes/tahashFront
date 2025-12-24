import { ResponseCode } from "@shared/types/response-code";
import {
  ApiResponse,
  errorResponse,
  isApiResponse,
} from "@shared/types/api-response";
import { errorObject } from "@shared/interfaces/error-object";

const basePath = import.meta.env.VITE_API_PATH || "/api";
// const basePath = "https://api.ilcubers.com/api";
console.log("requestbasepath:", basePath);
enum RequestMethod {
  GET = "GET",
  POST = "POST",
}
interface QueuedRequest {
  cancelable: boolean;
  method: RequestMethod;
  path: string;
  task: () => Promise<ApiResponse>;
  resolve: (res: ApiResponse) => void;
  reject: (err: any) => void;
}

const requestQueue: QueuedRequest[] = [];
let isProcessing = false;

/**
 * The "worker" that processes the queue.
 */
async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  isProcessing = true;

  const { task, resolve, reject } = requestQueue.shift()!;
  try {
    const response = await task();
    resolve(response);
  } catch (err) {
    reject(err);
  } finally {
    isProcessing = false;
    processQueue().then();
  }
}

/**
 * Clear the cancelable queued requests waiting to run
 */
export function cancelPendingRequests() {
  for (let i = 0; i < requestQueue.length; i++) {
    if (!requestQueue[i].cancelable) continue;
    requestQueue[i].resolve(
      new ApiResponse(ResponseCode.Aborted, "Request Aborted"),
    );
    requestQueue.splice(i, 1);
  }
}

/**
 * Send a GET request to the API
 * @param path The request's path
 * @param headers Headers to send with the response
 * @returns An ApiResponse that matches the response from the server
 */
export async function _internalSendGetRequest(
  path: string,
  headers: HeadersInit = {},
) {
  try {
    const res = await fetch(basePath + path, {
      credentials: "include",
      headers,
    });

    if (!res.ok)
      return new ApiResponse(
        ResponseCode.Error,
        `Request Error - Bad Response ${res.status}`,
      );

    let apiRes = await res.json();
    if (!isApiResponse(apiRes)) return errorResponse("Invalid Server Response");
    apiRes = new ApiResponse(apiRes.code, apiRes.data); // re-hydrate

    return apiRes;
  } catch (err: any) {
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
 * @param headers Headers to add to the request
 * @param body The body to send
 */
export async function _internalSendPostRequest(
  path: string,
  body: object,
  headers: HeadersInit = {},
): Promise<ApiResponse> {
  try {
    const res = await fetch(basePath + path, {
      method: "post",
      headers: {
        ...headers,
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

    let apiRes = await res.json();
    if (!isApiResponse(apiRes)) return errorResponse("Invalid Server Response");
    apiRes = new ApiResponse(apiRes.code, apiRes.data); // re-hydrate

    return apiRes;
  } catch (err) {
    console.error(`Network error (POST to ${path}):`, err);
    return errorResponse("Network Error");
  }
}

function enqueueRequest(
  path: string,
  method: RequestMethod,
  newRequest: QueuedRequest,
  overrideExisting: boolean,
) {
  const existingIndex = getRequestIndex(path, method);
  const doOverride =
    overrideExisting &&
    existingIndex >= 0 &&
    requestQueue[existingIndex].cancelable;

  if (doOverride) {
    requestQueue[existingIndex].resolve(
      new ApiResponse(ResponseCode.Aborted, "Request Overridden"),
    );
    requestQueue[existingIndex] = newRequest;
  } else requestQueue.push(newRequest);

  processQueue().then();
}

/**
 * Send a GET request to the API
 * @param path The request's path
 * @param headers Headers to send with the response
 * @param cancelable Whether the request should abort when the abort trigger is activated
 * @param overrideExisting If a cancelable GET request to this path already exists in the queue, should the new one override it? If false, the new request is added to the request queue.
 * @returns An ApiResponse that matches the response from the server
 */
export function sendGetRequest(
  path: string,
  headers: HeadersInit = {},
  cancelable: boolean = true,
  overrideExisting: boolean = true,
): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const newRequest = {
      cancelable,
      method: RequestMethod.GET,
      path: path,
      task: () => _internalSendGetRequest(path, headers),
      resolve,
      reject,
    };
    enqueueRequest(path, RequestMethod.GET, newRequest, overrideExisting);
  });
}

/**
 * Send a GET request to the API
 * @param path The request's path
 * @param headers Headers to send with the response
 * @param body The body to send
 * @param cancelable Whether the request should abort when the abort trigger is activated
 * @param overrideExisting If a cancelable POST request to this path already exists in the queue, should the new one override it? If false, the new request is added to the request queue.
 * @returns An ApiResponse that matches the response from the server
 */
export function sendPostRequest(
  path: string,
  body: object,
  headers: HeadersInit = {},
  cancelable: boolean = true,
  overrideExisting: boolean = true,
): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const newRequest = {
      cancelable,
      method: RequestMethod.POST,
      path: path,
      task: () => _internalSendPostRequest(path, body, headers),
      resolve,
      reject,
    };
    enqueueRequest(path, RequestMethod.POST, newRequest, overrideExisting);
  });
}

function getRequestIndex(path: string, method: RequestMethod): number {
  return requestQueue.findIndex((qr) => qr.path == path && qr.method == method);
}

export function requestInQueue(path: string, method: RequestMethod): boolean {
  return getRequestIndex(path, method) >= 0;
}
