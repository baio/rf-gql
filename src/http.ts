import * as req  from "request-promise-native";
import { sprintf } from "sprintf-js";
import { log, cleanObj } from "./utils";
import * as R from "ramda";
import {Reader, Future} from "ramda-fantasy";
import { ofPromise, ReaderF, mapPromise, mutateAsk } from "./future-utils";

//////
export interface RequestGet {
  url: string
  headers?: { [key: string] : any }
  qs?: { [key: string] : any }
}

export interface RequestPost extends RequestGet {
  body?: any
}

export type RequestMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Request extends RequestPost {
  method: RequestMethods
};

export type RequestPromise = (request: Request) => Promise<any>;

/**
 * Accepts request obj and retuns promise which run http request with resuest params.
 *
 * @param {Request} request
 */
export const requestPromise: RequestPromise = request => {
  console.log(">>> request", request);
  return req(request.url, {
      method: request.method,
      headers: request.headers,
      qs: request.qs,
      json: true,
      body: request.body
  })
  .then(
    res => {
      console.log(">>> response success", res);
      return res;
    },
    err => {
      console.log(">>> response err", err);
      throw err;
    }
  );

}

/**
 * Reader<Request, Future<any, any>>
*/
export const request = mapPromise<Request, any>(requestPromise).map(Future.cache);


const requestMethod = method => mutateAsk(R.merge({ method }))(request);
export const get: ReaderF<RequestGet, any> = requestMethod("GET");
export const post: ReaderF<RequestPost, any> = requestMethod("POST");
export const put: ReaderF<RequestPost, any> = requestMethod("PUT");
export const patch: ReaderF<RequestPost, any> = requestMethod("PATCH");
export const del: ReaderF<RequestPost, any> = requestMethod("DELETE");





