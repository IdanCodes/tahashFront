import { ResponseCode } from "@shared/types/response-code";
import {
  ApiResponse,
  errorResponse,
  isApiResponse,
} from "@shared/types/api-response";
import { errorObject } from "@shared/interfaces/error-object";
import { isAbortError } from "../errorUtils";

const basePath = "/api";
enum RequestMethod {
  GET = "GET",
  POST = "POST",
}
interface QueuedRequest {
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

  console.log("Start process", [...requestQueue]);
  const { task, resolve, reject } = requestQueue.shift()!;
  try {
    const response = await task();
    resolve(response);
  } catch (err) {
    reject(err);
  } finally {
    console.log("Stop process", [...requestQueue]);
    isProcessing = false;
    processQueue().then();
  }
}

/**
 * A global set to store all active AbortControllers
 */
const activeAbortControllers = new Set<AbortController>();

export function abortAllActiveRequests() {
  console.log(`Aborting ${activeAbortControllers.size} requests...`);
  for (const controller of activeAbortControllers) controller.abort();

  requestQueue.splice(0, requestQueue.length);
  activeAbortControllers.clear();
}

/**
 * Send a GET request to the API
 * @param path The request's path
 * @param headers Headers to send with the response
 * @param abortable Whether the request should abort when the abort trigger is activated
 * @returns An ApiResponse that matches the response from the server
 */
export async function _internalSendGetRequest(
  path: string,
  headers: HeadersInit = {},
  abortable: boolean = true,
) {
  const abortController = new AbortController();
  if (abortable) activeAbortControllers.add(abortController);

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
    if (abortController.signal.aborted) {
      console.log(`GET request to ${path} aborted`);
      return new ApiResponse(ResponseCode.Aborted, "Request Aborted");
    }

    console.error(`Network error (GET to ${path}):`, err);
    return new ApiResponse(
      ResponseCode.Error,
      errorObject(`Network Error (GET to ${path})`, err),
    );
  } finally {
    if (abortable) activeAbortControllers.delete(abortController);
  }
}

/**
 * Send a POST request to the API
 * @param path The request's path (Not including /api)
 * @param headers Headers to add to the request
 * @param body The body to send
 * @param abortable Whether the request should abort when the abort trigger is activated
 */
export async function _internalSendPostRequest(
  path: string,
  body: object,
  headers: HeadersInit = {},
  abortable: boolean = true,
): Promise<ApiResponse> {
  const abortController = new AbortController();
  if (abortable) activeAbortControllers.add(abortController);

  try {
    const res = await fetch(basePath + path, {
      method: "post",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
      signal: abortable ? abortController.signal : undefined,
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
    if (isAbortError(err)) {
      console.log(`POST request to ${path} aborted`);
      return new ApiResponse(ResponseCode.Aborted, "Request Aborted");
    }

    console.error(`Network error (POST to ${path}):`, err);
    return errorResponse("Network Error");
  } finally {
    if (abortable) activeAbortControllers.delete(abortController);
  }
}

/**
 * Send a GET request to the API
 * @param path The request's path
 * @param headers Headers to send with the response
 * @param abortable Whether the request should abort when the abort trigger is activated
 * @param overrideExisting If a GET request to this path already exists in the queue, should the new one override it? If false, the new request is added to the request queue.
 * @returns An ApiResponse that matches the response from the server
 */
export function sendGetRequest(
  path: string,
  headers: HeadersInit = {},
  abortable: boolean = true,
  overrideExisting: boolean = true,
): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const newRequest = {
      method: RequestMethod.GET,
      path: path,
      task: () => _internalSendGetRequest(path, headers, abortable),
      resolve,
      reject,
    };
    const existingIndex = getRequestIndex(path, RequestMethod.GET);
    if (overrideExisting && existingIndex >= 0)
      requestQueue[existingIndex] = newRequest;
    else requestQueue.push(newRequest);

    processQueue().then();
  });
}

/**
 * Send a GET request to the API
 * @param path The request's path
 * @param headers Headers to send with the response
 * @param body The body to send
 * @param abortable Whether the request should abort when the abort trigger is activated
 * @param overrideExisting If a POST request to this path already exists in the queue, should the new one override it? If false, the new request is added to the request queue.
 * @returns An ApiResponse that matches the response from the server
 */
export function sendPostRequest(
  path: string,
  body: object,
  headers: HeadersInit = {},
  abortable: boolean = true,
  overrideExisting: boolean = true,
): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const newRequest = {
      method: RequestMethod.POST,
      path: path,
      task: () => _internalSendPostRequest(path, body, headers, abortable),
      resolve,
      reject,
    };
    const existingIndex = getRequestIndex(path, RequestMethod.POST);
    if (overrideExisting && existingIndex >= 0)
      requestQueue[existingIndex] = newRequest;
    else requestQueue.push(newRequest);

    processQueue().then();
  });
}

function getRequestIndex(path: string, method: RequestMethod): number {
  return requestQueue.findIndex((qr) => qr.path == path && qr.method == method);
}

export function requestInQueue(path: string, method: RequestMethod): boolean {
  return getRequestIndex(path, method) >= 0;
}
