/**
 * Contains the full list of API route paths used in the application.
 */
export const RoutePath = {
    // page routes
    Page: {
        Home: "/",
        Profile: "/profile",
        Scrambles: "/scrambles",
        Error: "/error",
        WcaAuthCallback: "/wca-auth-callback",
        CompeteEvent: "/compete/:eventId",
        AdminPanel: "/admin-panel",
        AdminPanelEvent: "/admin-panel/:eventId",
        Results: "/results",
        ResultsEvent: "/results/:eventId",
        Instructions: "/instructions",
        About: "/about",

        RedirectToAuth: "/redirect-to-auth",
        AuthCallback: "/auth-callback",
        UserPage: "/user/:wcaId",
    },

    // get requests
    Get: {
        AuthWcaUrl: "/auth-wca-url",
        UserInfo: "/user-info",
        Logout: "/logout",
        CompEventsDisplays: "/comp-events-displays",
        EventsAndSubmissionOverviews: "/events-and-submission-overviews",
        EventsDisplayAndStatus: "/comp-display-status",
        UserEventData: "/user-event-data",
        EventDisplayInfo: "/event-display-info",
        ActiveCompInfo: "/active-comp-info",
        CompDisplayInfo: "/comp-display-info",
        EventResultDisplays: "/event-result-displays",
        CompetitorData: "/competitor-data",

        RetrieveTimes: "/retrieve-times",
        GetActiveCompEvents: "/active-comp-events",
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
