export const HttpHeaders = {
    USER_ID: 'x-user-id',
    EVENT_ID: 'x-event-id',
} as const;
Object.values(HttpHeaders)

export type HttpHeaderKey = keyof typeof HttpHeaders;
export type HttpHeaderValue = typeof HttpHeaders[HttpHeaderKey];