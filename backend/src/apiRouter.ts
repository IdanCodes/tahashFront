import { Request, Response, Router } from "express";
import { ResponseCode } from "@shared/types/response-code";
import { ApiResponse } from "@shared/types/api-response";
import { TahashUserSession } from "./interfaces/tahash-user-session";
import { QueryParams } from "@shared/constants/query-params";
import { RoutePath } from "@shared/constants/route-path";
import { validate } from "./middleware/validate";
import { authHandlers } from "./handlers/auth-handlers";
import { createMongoSession } from "./middleware/db-session";
import { authWcaUrlSchemas, codeExchangeSchemas } from "./schemas/wca-schemas";
import { refreshWcaSession } from "./middleware/auth/refresh-wca-session";
import { requireAuth } from "./middleware/auth/require-auth";
import { userHandlers } from "./handlers/user-handlers";
import { compHandlers } from "./handlers/comp-handlers";
import {
  eventDisplayInfoSchemas,
  eventSubmissionsSchemas,
  updateSubmissionStateSchemas,
  updateTimesSchemas,
  userEventDataSchemas,
} from "./schemas/comp-schemas";
import { requireAdmin } from "./middleware/require-admin";

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

router.get(RoutePath.Get.Logout, requireAuth, userHandlers.logout);

router.get(
  RoutePath.Get.EventsDisplayAndStatus,
  requireAuth,
  compHandlers.eventsDisplayAndStatus,
);

router.get(
  RoutePath.Get.CompEventsDisplays,
  requireAuth,
  compHandlers.compEventsDisplays,
);

router.get(
  RoutePath.Get.EventDisplayInfo,
  requireAuth,
  validate(eventDisplayInfoSchemas),
  compHandlers.eventDisplayInfo,
);

router.get(
  RoutePath.Get.UserEventData,
  requireAuth,
  validate(userEventDataSchemas),
  compHandlers.userEventData,
);

router.post(
  RoutePath.Post.UpdateTimes,
  requireAuth,
  validate(updateTimesSchemas),
  compHandlers.updateTimes,
);

// admin

router.get(
  RoutePath.Get.EventSubmissions,
  requireAuth,
  requireAdmin,
  validate(eventSubmissionsSchemas),
  compHandlers.eventSubmissions,
);

router.post(
  RoutePath.Post.UpdateSubmissionState,
  requireAuth,
  requireAdmin,
  validate(updateSubmissionStateSchemas),
  compHandlers.updateSubmissionState,
);

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
// router.get(RoutePath.Get.GetCompEvents, async (req: Request, res: Response) => {
//   if (!isLoggedIn(req)) return res.json();
//
//   // comp number parameter
//   const compNumber: number | undefined = Number(
//     req.query[QueryParams.CompNumber],
//   );
//   if (!compNumber)
//     return res.json(
//       new ApiResponse(
//         ResponseCode.Error,
//         "Required comp number as a query parameter",
//       ),
//     );
//
//   const eventIds = await CompManager.getInstance().getCompEventIds(compNumber);
//   if (!eventIds)
//     return res.json(
//       new ApiResponse(
//         ResponseCode.Error,
//         `Comp with comp number ${compNumber} does not exist.`,
//       ),
//     );
//
//   res.json(new ApiResponse(ResponseCode.Success, eventIds));
// });

export default router;
