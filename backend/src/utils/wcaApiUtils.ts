import {
  errorObject,
  ErrorObject,
  isErrorObject,
} from "@shared/interfaces/error-object";
import { UserInfo, wcaUserToUserInfo } from "@shared/interfaces/user-info";
import {
  WcaMeResponse,
  WcaUserResponse,
} from "@shared/interfaces/wca-api/wcaUser";
import { getEnv } from "../config/env";
import { WcaOAuthTokenResponse } from "@shared/interfaces/wca-api/wcaOAuth";
import {
  EventRecords,
  eventRecordToGeneralRecords,
  GeneralRecord,
} from "@shared/types/event-records";
import { TimeFormat } from "@shared/constants/time-formats";
import { EventId, getEventById } from "@shared/types/comp-event";
import {
  WcaEventRanksModel,
  WcaPersonModel,
} from "../interfaces/wca-person-model";
import {
  AO5BestResults,
  FMCBestResults,
  MO3BestResults,
  MbldBestResults,
  ResultFormatMap,
} from "../types/result-format";
import { Penalties } from "@shared/constants/penalties";
import {
  calcMultiBldTotalPoints,
  ExtraArgsMbld,
} from "@shared/interfaces/event-extra-args/extra-args-mbld";

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
 * Unofficial REST API from:
 * https://wca-rest-api.robiningelbrecht.be/#section/Introduction
 */
const WCA_REST_API_PATH =
  "https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api";

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
  const body = await httpRes.json();
  if (!httpRes.ok) {
    console.log(`${options.method} request to ${path}`, body);
    return errorObject(`HTTP Error: "${httpRes.statusText}"`, body);
  }

  if (body !== null && "error" in body)
    return errorObject(
      `WCA API Error: "${body.error}" - ${body.error_description}`,
    );

  return body as T;
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
export async function getWCARecordsOfUser(
  wcaId: string,
): Promise<Map<EventId, EventRecords<TimeFormat>> | ErrorObject> {
  const wcaPerson = await getWcaPerson(wcaId);
  if (!wcaPerson) return errorObject("Error retrieving person's records");

  const records: Map<EventId, EventRecords<TimeFormat>> = new Map();

  const { singles, averages } = wcaPerson.rank;
  extractSingles(records, singles);
  extractAverages(records, averages);

  return records;

  function extractSingles(
    records: Map<EventId, EventRecords<TimeFormat>>,
    singles: WcaEventRanksModel[],
  ) {
    for (let i = 0; i < singles.length; i++) {
      const eventId = singles[i].eventId;
      const compEvent = getEventById(eventId);
      if (!compEvent) continue;

      let newRecord: EventRecords<TimeFormat> | undefined = undefined;
      if (compEvent.timeFormat === TimeFormat.multi) {
        // Encoding information: https://www.worldcubeassociation.org/export/results
        const numberFormat = singles[i].best.toString();
        const DD = Number(numberFormat.substring(1, 3));
        const TTTTT = Number(numberFormat.substring(3, 8));
        const MM = Number(numberFormat.substring(8));
        const difference = 99 - DD;
        const timeInSeconds = TTTTT;
        const missed = MM;
        const solved = difference + missed;
        const attempted = solved + missed;
        const points = calcMultiBldTotalPoints({
          numSuccess: solved,
          numAttempt: attempted,
        } as ExtraArgsMbld);

        newRecord = {
          bestSingle: {
            centis: timeInSeconds / 100.0, // convert to centiseconds
            penalty: points <= 0 ? Penalties.DNF : Penalties.None,
            extraArgs: {
              numSuccess: solved,
              numAttempt: attempted,
            } as ExtraArgsMbld,
          },
          bestComp: 0,
        };
      } else if (compEvent.eventId === "333fm") {
        newRecord = {
          single: singles[i].best,
          singleComp: 0,
          mean: -1,
          meanComp: -1,
        } as FMCBestResults;
      } else if (compEvent.timeFormat === TimeFormat.ao5) {
        newRecord = {
          single: {
            centis: singles[i].best,
            penalty: Penalties.None,
            extraArgs: undefined,
          },
          singleComp: 0,
          average: -1,
          averageComp: -1,
        };
      } else if (
        compEvent.timeFormat === TimeFormat.mo3 ||
        compEvent.timeFormat === TimeFormat.bo3
      ) {
        newRecord = {
          single: {
            centis: singles[i].best,
            penalty: Penalties.None,
            extraArgs: undefined,
          },
          singleComp: 0,
          average: -1,
          averageComp: -1,
        };
      }

      if (newRecord) records.set(singles[i].eventId, newRecord);
    }
  }

  function extractAverages(
    records: Map<EventId, EventRecords<TimeFormat>>,
    averages: WcaEventRanksModel[],
  ) {
    for (let i = 0; i < averages.length; i++) {
      const eventId = averages[i].eventId;
      const compEvent = getEventById(eventId);
      if (!compEvent) continue;

      const existingRecord: EventRecords<TimeFormat> | undefined =
        records.get(eventId);
      let newRecord: EventRecords<TimeFormat> | undefined = undefined;
      if (compEvent.eventId === "333fm") {
        newRecord = existingRecord
          ? ({
              ...existingRecord,
              mean: averages[i].best,
              meanComp: 0,
            } as FMCBestResults)
          : { single: -1, singleComp: -1, mean: averages[i].best, meanComp: 0 };
      } else if (compEvent.timeFormat === TimeFormat.ao5) {
        newRecord = existingRecord
          ? {
              ...existingRecord,
              average: averages[i].best,
              averageComp: 0,
            }
          : {
              single: {
                centis: -1,
                penalty: Penalties.None,
                extraArgs: undefined,
              },
              singleComp: -1,
              average: averages[i].best,
              averageComp: 0,
            };
      } else if (
        compEvent.timeFormat === TimeFormat.mo3 ||
        compEvent.timeFormat === TimeFormat.bo3
      ) {
        newRecord = existingRecord
          ? {
              ...existingRecord,
              mean: averages[i].best,
              meanComp: 0,
            }
          : {
              single: {
                centis: -1,
                penalty: Penalties.None,
                extraArgs: undefined,
              },
              singleComp: -1,
              mean: averages[i].best,
              meanComp: 0,
            };
      }

      if (newRecord) records.set(averages[i].eventId, newRecord);
    }
  }
}

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

// -- Helpers for REST API

const fetchWcaRestApi = async (path: string): Promise<object> => {
  const res = await fetch(WCA_REST_API_PATH + path);
  if (!res.ok) {
    console.error("ERROR: REST API ERROR (fetchWcaRestApi).");
    return errorObject("An error occurred while fetching from REST API.");
  }

  return await res.json();
};

/**
 * Get a WCA person model from the WCA REST API
 * @param wcaId The person's WCA id
 */
export async function getWcaPerson(
  wcaId: string,
): Promise<WcaPersonModel | undefined> {
  const response = await fetchWcaRestApi(`/persons/${wcaId}.json`);
  if (isErrorObject(response)) {
    console.error(`REST API Error: Could not fetch person "${wcaId}"`);
    return undefined;
  }

  return response as WcaPersonModel;
}
