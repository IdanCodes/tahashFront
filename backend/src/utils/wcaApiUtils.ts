import {
  errorObject,
  ErrorObject,
  isErrorObject,
} from "@shared/interfaces/error-object";
import { UserInfo, wcaUserToUserInfo } from "../interfaces/user-info";
import {
  WcaMeResponse,
  WcaUserResponse,
} from "@shared/interfaces/wca-api/wcaUser";
import { getEnv } from "./env";
import { WcaOAuthTokenResponse } from "@shared/interfaces/wca-api/wcaOAuth";

/**
 * WCA OAuth application id (environment variable)
 */
const APP_ID = getEnv("WCA_APP_ID");

/**
 * WCA Application Secret
 */
const clientSecret = getEnv("WCA_CLIENT_SECRET");

/**
 * WCA Website Base URL
 */
const WCA_BASE_URL = "https://www.worldcubeassociation.org";

/**
 * WCA Api Path
 */
const WCA_API_PATH = "/api/v0";

/**
 * WCA Callback Path
 */
export const WCA_CALLBACK_PATH = "/auth-wca-callback";

/**
 * Get the WCA auth url given the host's base url
 * @param redirectUri The url to redirect to
 */
export const WCA_AUTH_URL = (redirectUri: string): string => {
  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "",
  });

  return `${WCA_BASE_URL}/oauth/authorize?${params}`;
};

/**
 * Sends a request to the WCA API. handles the response
 * @param path The path for the request url (e.g "/oauth/token").
 * @param options Options for the fetch request.
 * @returns
 * - If an error occurred, returns an {@link ErrorObject} with information.
 * - Otherwise, returns the data received from the API as a JSON object.
 */
async function sendWCARequest<T>(
  path: string,
  options: RequestInit = { method: "GET" },
): Promise<ErrorObject | T> {
  const reqUrl = `${WCA_BASE_URL}${path}`;
  const httpRes: Response = await fetch(reqUrl, options);
  if (!httpRes.ok)
    return errorObject(
      `HTTP Error: "${httpRes.statusText}"`,
      await httpRes.json(),
    );

  const data: any = await httpRes.json();
  if (data !== null && "error" in data)
    return errorObject(
      `WCA API Error: "${data.error}" - ${data.error_description}`,
    );

  return data as T;
}

/**
 * Get the {@link UserInfo} of a user using an access token.
 * @param token The user's authentication token.
 * @return
 * - If an error occurred, returns an {@link ErrorObject} with details.
 * - Otherwise, returns the requested {@link UserInfo}.
 */
export async function getUserDataByToken(
  token: string,
): Promise<ErrorObject | UserInfo> {
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  };

  const response: ErrorObject | WcaMeResponse = await sendWCARequest(
    `${WCA_API_PATH}/me`,
    options,
  );
  if (isErrorObject(response)) return response;

  // no error, build and return the UserInfo
  return wcaUserToUserInfo(response.me);
}

/**
 * Get the {@link UserInfo} of a user using an access token.
 * @param userId The user's WCA user id number.
 * @return
 * - If an error occurred, returns an {@link ErrorObject} with details.
 * - Otherwise, returns the requested {@link UserInfo}.
 */
export async function getUserDataByUserId(
  userId: number,
): Promise<ErrorObject | UserInfo> {
  const response: ErrorObject | WcaUserResponse =
    await sendWCARequest<WcaUserResponse>(`${WCA_API_PATH}/users/${userId}`);
  if (isErrorObject(response)) return response;

  // no error, build and return the UserInfo
  return wcaUserToUserInfo(response.user);
}

/* returns a "records" array of the user's WCA records */
// TODO: implement getWCARecordsOfUser
// export async function getWCARecordsOfUser(
//   userId: number,
// ): Promise<Record<string, EventRecords<TimeFormat>>> {
//   console.error("getWCARecordsOfUser not implemented");
//   return {};
// }

/**
 * Exchange an authentication token for a {@link WcaOAuthTokenResponse} object.
 * @param authCode The authentication code to use.
 * @param redirectUri The url to redirect to
 */
export async function exchangeAuthCode(
  authCode: string,
  redirectUri: string,
): Promise<ErrorObject | WcaOAuthTokenResponse> {
  // build the HTTP Request
  const body = {
    client_id: APP_ID,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: redirectUri,
  };

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };

  return await sendWCARequest<WcaOAuthTokenResponse>("/oauth/token", options);
}

/**
 * Request a new authentication token using a refresh token from a previous call.
 * @param refreshToken The refresh token to use.
 */
export async function renewAuthentication(
  refreshToken: string,
): Promise<ErrorObject | WcaOAuthTokenResponse> {
  // build the HTTP request
  const body = {
    client_id: APP_ID,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };

  return await sendWCARequest<WcaOAuthTokenResponse>("/oauth/token", options);
}
