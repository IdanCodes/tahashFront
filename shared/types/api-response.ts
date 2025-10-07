import {ResponseCode} from "./response-code";

/**
 * A response from the API
 */
export class ApiResponse {
    code: ResponseCode;
    data: any | null;

    constructor(
        code: ResponseCode,
        data: any | null = null,
    ) {
        this.code = code;
        this.data = data;
    }
}

export function isApiResponse(data: any): data is ApiResponse {
    return (typeof data === 'object' && data !== null && "code" in data && "data" in data);
}
