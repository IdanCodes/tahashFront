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

    get hasError() {
        return this.code == ResponseCode.Error;
    }
}

export function isApiResponse(data: any): data is ApiResponse {
    return (typeof data === 'object' && data !== null && "code" in data && "data" in data);
}

/**
 * A helper to create an {@link ApiResponse} with an error
 */
export function errorResponse(error: any | null = null) {
    return new ApiResponse(ResponseCode.Error, error);
}
