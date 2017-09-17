import { ReaderF } from "./future-utils";
export interface RequestGet {
    url: string;
    headers?: {
        [key: string]: any;
    };
    qs?: {
        [key: string]: any;
    };
}
export interface RequestPost extends RequestGet {
    body?: any;
}
export declare type RequestMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface Request extends RequestPost {
    method: RequestMethods;
}
export declare type RequestPromise = (request: Request) => Promise<any>;
/**
 * Accepts request obj and retuns promise which run http request with resuest params.
 *
 * @param {Request} request
 */
export declare const requestPromise: RequestPromise;
/**
 * Reader<Request, Future<any, any>>
*/
export declare const request: any;
export declare const get: ReaderF<RequestGet, any>;
export declare const post: ReaderF<RequestPost, any>;
export declare const put: ReaderF<RequestPost, any>;
export declare const patch: ReaderF<RequestPost, any>;
export declare const del: ReaderF<RequestPost, any>;
