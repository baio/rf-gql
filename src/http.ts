import { join } from "path";
import { request as requestN } from "request-promise-native";
import { sprintf } from "sprintf-js";
import { log, cleanObj } from "./utils";
import * as R from "ramda";
import {Reader, Future} from "ramda-fantasy";
import { future, ReaderF, mapPromise } from "./future-utils";

//////

export interface Request {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  url: string
  headers?: { [key: string] : any }
  qs?: { [key: string] : any }
  body?: any
};

export type RequestPromise = (request: Request) => Promise<any>;
export const requestPromise: RequestPromise = request =>
  requestN({
      uri: request.url,
      method: request.method,
      headers: request.headers,
      qs: request.qs,
      json: true
  }).promise();

//export const request = toFutureReader<Request, any>(requestPromise);




