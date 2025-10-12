/**
 * Contains the full list of API route paths used in the application.
 */
export const RoutePath = {
    // page routes
    Page: {
        HomeRedirect: "/",
        Login: "/login",
        Profile: "/profile",
        Scrambles: "/scrambles",
        Error: "/error",
        WcaAuthCallback: "/wca-auth-callback",

        RedirectToAuth: "/redirect-to-auth",
        AuthCallback: "/auth-callback",
        CompeteEvent: "/compete/:eventId",
        AdminDashboard: "/admin-dashboard",
        Home: "/home",
    },

    // get requests
    Get: {
        AuthWcaUrl: "/auth-wca-url",
        UserInfo: "/user-info",
        Logout: "/logout",
        GetCompEvents: "/comp-events",
        GetActiveCompEvents: "/active-comp-events",
        EventsDisplayAndStatus: "/comp-display-status",

        RetrieveTimes: "/retrieve-times",
        EventStatuses: "/event-statuses",
        IsAdmin: "/is-admin",
        GetEventSubmissions: "/get-event-submissions",
        WCAUserData: "/wca-user.ts-data",
        AuthenticateWithCode: "/auth-with-code",
        AuthenticateRefreshToken: "/auth-refresh-token",
    },

    // post requests
    Post: {
        WcaCodeExchange: "/wca-code-exchange",

        UpdateTimes: "/update-times",
        UpdateHostname: "/update-hostname",
        UpdateSubmissionState: "/update-submission-state",
    },
} as const;
