import { join } from "path";
import * as req  from "request-promise-native";
import { sprintf } from "sprintf-js";
import { log, cleanObj } from "./utils";
import * as R from "ramda";
import {Reader, Future} from "ramda-fantasy";
import { future, ReaderF, mapPromise, reshape } from "./future-utils";

//////
export interface RequestGet {
  url: string
  headers?: { [key: string] : any }
  qs?: { [key: string] : any }
}

export interface RequestPost extends RequestGet {
  body?: any
}

export interface Request extends RequestPost {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
};

export type RequestPromise = (request: Request) => Promise<any>;

/**
 * Accepts request obj and retuns promise which run http request with resuest params.
 *
 * @param {Request} request
 */
export const requestPromise: RequestPromise = request =>
  req(request.url, {
      method: request.method,
      headers: request.headers,
      qs: request.qs,
      json: true
  }).promise();

/**
 * Reader<Request, Future<any, any>>
*/
export const request = mapPromise<Request, any>(requestPromise);

const requestMethod = method => reshape(R.merge({ method }))(request);
export const get: ReaderF<RequestGet, any> = requestMethod("GET");
export const post: ReaderF<RequestPost, any> = requestMethod("POST");
export const put: ReaderF<RequestPost, any> = requestMethod("PUT");
export const patch: ReaderF<RequestPost, any> = requestMethod("PATCH");
export const del: ReaderF<RequestPost, any> = requestMethod("DELETE");





