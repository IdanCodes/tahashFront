import { Response } from "express";
import { ApiResponse } from "@shared/types/api-response";
import { ResponseCode } from "@shared/types/response-code";
import {
  exchangeAuthCode,
  getUserDataByToken,
  WCA_AUTH_URL,
} from "../utils/wcaApiUtils";
import { errorObject, isErrorObject } from "@shared/interfaces/error-object";
import {
  AuthWcaUrlQueryInput,
  AuthWcaUrlRequest,
  CodeExchangeBodyInput,
  CodeExchangeQueryInput,
  CodeExchangeRequest,
} from "../schemas/wca-schemas";

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
  if (isErrorObject(tokenRes))
    return res.json(new ApiResponse(ResponseCode.Error, tokenRes));

  // Fetch WCA user data
  const userInfo = await getUserDataByToken(tokenRes.access_token);
  if (isErrorObject(userInfo))
    return res.json(new ApiResponse(ResponseCode.Error, userInfo));

  // Save user's data in session
  req.session.userSession = {
    access_token: tokenRes.access_token,
    refresh_token: tokenRes.refresh_token,
    expiration: new Date().getTime() + tokenRes.expires_in * 100,
    userInfo: userInfo,
  };

  req.session.save((err) => {
    res.json(
      err
        ? new ApiResponse(
            ResponseCode.Error,
            errorObject("Error saving session", err),
          )
        : new ApiResponse(ResponseCode.Success, "Logged in successfully!"),
    );
  });
}

export const authHandlers = { authWcaUrl, wcaCodeExchange };
