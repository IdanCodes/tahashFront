import { Request, Response, Router } from "express";
import { ResponseCode } from "../../shared/types/response-code";
import { ApiResponse } from "../../shared/types/api-response";
import { exchangeAuthCode, WCA_AUTH_URL } from "./utils/wcaApiUtils";
import { getEnv } from "./utils/env";
import { errorObject } from "../../shared/interfaces/error-object";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(ResponseCode.Success, "Api Response"));
});

router.get("/auth-wca", (req: Request, res: Response) => {
  const redirectUri = req.query.redirect;
  if (typeof redirectUri !== "string")
    return res.status(400).json(errorObject("Missing redirect param"));
  res.redirect(WCA_AUTH_URL(redirectUri));
});

// exchange wca code
// url param "redirect" for the callback url
// body contains "code" parameter
router.post("/wca-code-exchange", async (req: Request, res: Response) => {
  const redirectUri = req.query.redirect;
  const authCode = req.body.code;
  if (typeof authCode !== "string")
    return res.json(new ApiResponse(ResponseCode.Error, "Missing code field"));

  if (typeof redirectUri !== "string")
    return res.json(
      new ApiResponse(ResponseCode.Error, "Missing redirect param"),
    );

  const tokenRes = await exchangeAuthCode(authCode, redirectUri);
  return res.json(new ApiResponse(ResponseCode.Success, tokenRes));
});

export default router;
