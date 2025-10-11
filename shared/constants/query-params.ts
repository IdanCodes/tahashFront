/**
 * Contains the names of query string parameters accepted by various HTTP endpoints.
 * Use these constants to ensure consistency when reading or writing query parameters in requests.
 */
export const QueryParams = {
  CompNumber: "comp-number",
  EventId: "event-id",
  Redirect: "redirect",
};

/**
 * A query parameter key
 */
export type QueryParam = (typeof QueryParams)[keyof typeof QueryParams];
