import { join } from "path";
import { request as requestN } from "request-promise-native";
import { sprintf } from "sprintf-js";
import { log, cleanObj } from "./utils";
import * as R from "ramda";
import {Reader, Future} from "ramda-fantasy";
import { future, ReaderF } from "./future-utils";

export interface GQLRequestParams {
  root: {[key: string] : any}
  args: {[key: string] : any}
  context: {[key: string] : any}
  meta: any
}

export type GQLRequest = GQLRequestParams & {urlPattern: string};

export interface HttpConfig {
  //common base url for all requests
  baseUrl: string
  //mapping [service name] -> url
  providers: {[key: string] : string}
}

export interface HttpApi {

  getHeaders?: (request: GQLRequest) => {[key: string] : string};
  //mapping [service name] -> url
  //providers: {[key: string] : string}
}

export interface GQLRequestContext {
  //provider name, see config.providers
  name: string
  config: HttpConfig
  request: GQLRequest
  api: HttpApi
}

/**
 * Given urlPattern and request args, format pattern with fields from args.
 *
 * @param {GQLRequestContext} `{request: {urlPattern, args}}`
 * @returns {string}
 */
const getRequestUrl = ({name, request: {urlPattern, args}, config: { baseUrl, providers }}: GQLRequestContext) : string =>
  join(
    baseUrl,
    providers[name],
    sprintf(urlPattern, R.merge({}, args))
  );

/**
 * Invoke api.getHeaders with request param
 *
 * @param {GQLRequestContext} {api: {getHeaders}, request}
 */
const getRequestHeaders = ({api: {getHeaders}, request}: GQLRequestContext) =>
  getHeaders ? getHeaders(request) : null;

export const gql2request : Reader<GQLRequestContext, Request> =
  Reader.of(url => headers => ({url, headers}))
  .ap(Reader(getRequestUrl))
  .ap(Reader(getRequestHeaders));

/*
export type RequestM = FutureReader<GQLRequestContext, any>;
export type CreateRequestM = (rqeuestPromise: RequestPromise) => RequestM;
const createrRequestM : CreateRequestM = R.compose(gql2request.chain, toFutureReader);

export const request = createrRequestM(createRequest);
*/
