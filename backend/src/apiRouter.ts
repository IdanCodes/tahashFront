import { Request, Response, Router } from "express";
import { ResponseCode } from "@shared/types/response-code";
import { ApiResponse } from "@shared/types/api-response";
import { TahashUserSession } from "./interfaces/tahash-user-session";
import { QueryParams } from "@shared/constants/query-params";
import { RoutePath } from "@shared/constants/route-path";
import { CompManager } from "./database/comps/comp-manager";
import { validate } from "./middleware/validate";
import { authHandlers } from "./handlers/auth-handlers";
import { createMongoSession } from "./middleware/db-session";
import { authWcaUrlSchemas, codeExchangeSchemas } from "./schemas/wca-schemas";
import { refreshWcaSession } from "./middleware/auth/refresh-wca-session";
import { requireAuth } from "./middleware/auth/require-auth";
import { userHandlers } from "./handlers/user-handlers";

const router = Router();

declare module "express-session" {
  interface SessionData {
    userSession: TahashUserSession;
  }
}

router.use(createMongoSession());

// Middleware to refresh an expired WCA session
router.use(refreshWcaSession);

// Test Endpoint
router.get("/", (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(ResponseCode.Success, "Api Response"));
});

router.get(
  RoutePath.Get.AuthWcaUrl,
  validate(authWcaUrlSchemas),
  authHandlers.authWcaUrl,
);

router.post(
  RoutePath.Post.WcaCodeExchange,
  validate(codeExchangeSchemas),
  authHandlers.wcaCodeExchange,
);

router.get(RoutePath.Get.UserInfo, userHandlers.userInfo);

router.get(RoutePath.Get.Logout, requireAuth(), userHandlers.logout);

/**
 * GET /getCompEvents?comp-number=X
 *
 * Get a competition's events' ids.
 *
 * Query Parameters:
 * - {@link QueryParams.CompNumber} (number): The competition number.
 *
 * Response (JSON):
 * - 200 OK: An array [ eventId: string ].
 * - 400 Bad Request: Error object if the comp number was invalid.
 * - 404 Not Found: Error object if the requested comp was not found.
 */
router.get(RoutePath.Get.GetCompEvents, async (req: Request, res: Response) => {
  if (!isLoggedIn(req)) return res.json();

  // comp number parameter
  const compNumber: number | undefined = Number(
    req.query[QueryParams.CompNumber],
  );
  if (!compNumber)
    return res.json(
      new ApiResponse(
        ResponseCode.Error,
        "Required comp number as a query parameter",
      ),
    );

  const eventIds = await CompManager.getInstance().getCompEventIds(compNumber);
  if (!eventIds)
    return res.json(
      new ApiResponse(
        ResponseCode.Error,
        `Comp with comp number ${compNumber} does not exist.`,
      ),
    );

  res.json(new ApiResponse(ResponseCode.Success, eventIds));
});

// get
router.get(
  RoutePath.Get.GetActiveCompEvents,
  (req: Request, res: Response) => {},
);

export default router;
