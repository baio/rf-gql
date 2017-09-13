import * as urlJoin from "url-join";
import { request as requestN } from "request-promise-native";
import { sprintf } from "sprintf-js";
import { log, cleanObj } from "./utils";
import * as R from "ramda";
import { Reader, Future } from "ramda-fantasy";
import { future, ReaderF, MapFun } from "./future-utils";
import { request, RequestMethods } from "./http";

export interface GQLRequest {
  root: { [key: string]: any };
  args: { [key: string]: any };
  context: { [key: string]: any };
  meta: any;
}

export interface Request {
  provider: string;
  method: RequestMethods;
  url: string;
}

export interface HttpConfig {
  //common base url for all requests
  baseUrl: string;
  //mapping [service name] -> url
  providers: { [key: string]: string };
  // requests middleware
  api: HttpApi;
}

export interface HttpApi {
  getHeaders?: (request: GQLRequest) => { [key: string]: string };
}

export interface GQLRequestContext {
  //provider name, see config.providers
  config: HttpConfig;
  request: Request;
  gqlRequest: GQLRequest;
}

/**
 * Remove empty paths from joined strings and then join rest.
 *
 * @param {...string[]} paths
 */
const join = (...paths: string[]) => urlJoin(...paths.filter(f => f));

/**
 * Given urlPattern and request args, format pattern with fields from args.
 *
 * @param {GQLRequestContext} `{request: {urlPattern, args}}`
 * @returns {string}
 */
const getRequestUrl = ({
  request: { provider, url },
  gqlRequest: { args },
  config: { baseUrl, providers }
}: GQLRequestContext): string => join(baseUrl, providers[provider], sprintf(url, R.merge({}, args)));

/**
 * Invoke api.getHeaders with request param
 *
 * @param {GQLRequestContext} {api: {getHeaders}, request}
 */
const getRequestHeaders = ({ config: { api: { getHeaders } }, gqlRequest }: GQLRequestContext) =>
  getHeaders ? getHeaders(request) : null;

export const gql2request: Reader<GQLRequestContext, Request> =
  Reader.of(url => headers => ({ url, headers }))
    .ap(Reader(getRequestUrl))
    .ap(Reader(getRequestHeaders));

export const requestF = (mapper: MapFun<Request, Reader<GQLRequest>>): ReaderF<GQLRequestContext, any> =>
  gql2request.chain(mapper).map(request.run);

export const createGQLRequestContext = (config: HttpConfig)  => (request: Request) => (gqlRequest: GQLRequest) : GQLRequestContext =>
  ({config, gqlRequest, request});

export const createGQLRequest = (root, args, context, meta): GQLRequest => ({root, args, context, meta});

export type ComposeContext = (config: HttpConfig)  => (request: Request) => (root, args, context, meta) => GQLRequestContext;
export const composeContext: ComposeContext = (config: HttpConfig)  => (request: Request) => //(root, args, context, meta) =>
  R.compose(createGQLRequestContext(config)(request), createGQLRequest);



/*
export type RequestM = FutureReader<GQLRequestContext, any>;
export type CreateRequestM = (rqeuestPromise: RequestPromise) => RequestM;
const createrRequestM : CreateRequestM = R.compose(gql2request.chain, toFutureReader);

export const request = createrRequestM(createRequest);
*/
