import { Reader } from "ramda-fantasy";
import { reshape } from "./future-utils";
import { gql2request, GQLRequestContext, HttpConfig } from "./graphql";
import { request } from "./http";
import { log, fmerge } from "./utils";
import * as R from "ramda";

describe("graphql", () => {
  it("run request from graphql context", done => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        ip: "ip",
        uuid: "uuid"
      },
      api: {}
    };

    const requestContext: GQLRequestContext = {
      config: httpConfig,
      request: {
        provider: "ip",
        url: "",
        method: "GET"
      },
      gqlRequest: {
        root: {},
        args: {},
        context: {},
        meta: {}
      }
    };

    gql2request
      .map(request.run)
      .run(requestContext)
      .fork(
        err => {
          expect(err).toBeNull();
          done();
        },
        res => {
          expect(res).toBeTruthy();
          done();
        }
      );
  });

  it("run request from graphql context + mapping", done => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        ip: "ip",
        uuid: "uuid"
      },
      api: {}
    };

    const requestContext: GQLRequestContext = {
      config: httpConfig,
      request: {
        provider: "ip",
        url: "",
        method: "GET"
      },
      gqlRequest: {
        root: {},
        args: {},
        context: {},
        meta: {}
      }
    };


    gql2request
      .chain(req =>
        Reader(ctx => ({...req, url: ctx.request.provider}))
      )
      .map(log)
      .map(request.run)
      .run(requestContext)
      .fork(
        err => {
          //unexpected url
          console.log(err);
          expect(err.toString()).toBe("RequestError: Error: Invalid URI \"ip\"");
          done();
        },
        res => {
          expect(res).toBeNull();
          done();
        }
      );
  });
});
