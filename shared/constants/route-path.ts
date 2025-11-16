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
        CompeteEvent: "/compete/:eventId",
        AdminPanel: "/admin-panel",
        AdminPanelEvent: "/admin-panel/:eventId",
        Results: "/results/:eventId",

        RedirectToAuth: "/redirect-to-auth",
        AuthCallback: "/auth-callback",
        Home: "/home",
    },

    // get requests
    Get: {
        AuthWcaUrl: "/auth-wca-url",
        UserInfo: "/user-info",
        Logout: "/logout",
        CompEventsDisplays: "/comp-events-displays",
        GetActiveCompEvents: "/active-comp-events",
        EventsDisplayAndStatus: "/comp-display-status",
        UserEventData: "/user-event-data",
        EventDisplayInfo: "/event-display-info",
        LastCompDisplayData: "/last-comp-display-data",

        RetrieveTimes: "/retrieve-times",
        EventStatuses: "/event-statuses",
        IsAdmin: "/is-admin",
        EventSubmissions: "/get-event-submissions",
        WCAUserData: "/wca-user.ts-data",
        AuthenticateWithCode: "/auth-with-code",
        AuthenticateRefreshToken: "/auth-refresh-token",
    },

    // post requests
    Post: {
        WcaCodeExchange: "/wca-code-exchange",
        UpdateTimes: "/update-times",
        UpdateSubmissionState: "/update-submission-state",

        UpdateHostname: "/update-hostname",
    },
} as const;
