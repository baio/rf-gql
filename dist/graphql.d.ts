import { Reader } from "ramda-fantasy";
import { ReaderF } from "./future-utils";
import { RequestMethods } from "./http";
export interface GQLRequest {
    root: {
        [key: string]: any;
    };
    args: {
        [key: string]: any;
    };
    context: {
        [key: string]: any;
    };
    meta: any;
}
export interface Request {
    provider: string;
    method: RequestMethods;
    url: string;
    qs?: {
        [key: string]: any;
    } | null;
    headers?: {
        [key: string]: any;
    } | null;
}
export interface HttpConfig {
    baseUrl: string;
    providers: {
        [key: string]: string;
    };
    api: HttpApi;
}
export interface HttpApi {
    getHeaders?: (request: GQLRequest) => {
        [key: string]: string;
    };
}
export interface GQLRequestContext {
    config: HttpConfig;
    request: Request;
    gqlRequest: GQLRequest;
}
export declare const gql2request: Reader<GQLRequestContext, Request>;
export declare const mapReaderF: <R>(r: any) => any;
export declare const requestF: any;
export declare const createGQLRequestContext: (config: HttpConfig) => (request: Request) => (gqlRequest: GQLRequest) => GQLRequestContext;
export declare const createGQLRequest: (root: any, args: any, context: any, meta: any) => GQLRequest;
export declare type ComposeContext = (config: HttpConfig) => (request: Reader<GQLRequest, Request>) => (root, args, context, meta) => GQLRequestContext;
export declare const composeContext: ComposeContext;
export declare type Resolver = (httpConfig: HttpConfig) => (req: Reader<GQLRequest, Request>) => <R>(reader: ReaderF<GQLRequestContext, R>) => (root, args, context, meta) => Promise<R>;
export declare const resolver: Resolver;
