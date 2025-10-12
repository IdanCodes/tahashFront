import { Response } from "express";
import { ApiResponse, errorResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";
import {
  exchangeAuthCode,
  getUserDataByToken,
  WCA_AUTH_URL,
} from "../utils/wcaApiUtils";
import { isErrorObject } from "@shared/interfaces/error-object";
import {
  AuthWcaUrlQueryInput,
  AuthWcaUrlRequest,
  CodeExchangeBodyInput,
  CodeExchangeQueryInput,
  CodeExchangeRequest,
} from "../schemas/wca-schemas";
import { updateAndSaveSession } from "../utils/session-helpers";

/**
 * Get the WCA authentication url based on a redirect url
 */
function authWcaUrl(req: AuthWcaUrlRequest, res: Response) {
  const { redirect } = req.query as AuthWcaUrlQueryInput;
  res
    .status(200)
    .json(new ApiResponse(ResponseCode.Success, WCA_AUTH_URL(redirect)));
}

/**
 * Exchange WCA code
 */
async function wcaCodeExchange(req: CodeExchangeRequest, res: Response) {
  const { redirect } = req.query as CodeExchangeQueryInput;
  const { authCode } = req.body as CodeExchangeBodyInput;

  // Exchange authentication code
  const tokenRes = await exchangeAuthCode(authCode, redirect);
  if (isErrorObject(tokenRes)) return res.json(errorResponse(tokenRes));

  // Fetch WCA user data
  const userInfo = await getUserDataByToken(tokenRes.access_token);
  if (isErrorObject(userInfo)) return res.json(errorResponse(userInfo));

  updateAndSaveSession(req, tokenRes, userInfo);
  res.json(new ApiResponse(ResponseCode.Success, "Logged in successfully!"));
}

export const authHandlers = { authWcaUrl, wcaCodeExchange };
