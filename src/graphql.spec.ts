import { Reader } from "ramda-fantasy";
import { reshape } from "./future-utils";
import { gql2request, GQLRequestContext, HttpConfig, requestF, Request, composeContext, GQLRequest } from "./graphql";
import { request, Request as HttpRequest } from "./http";
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

    requestF(req => Reader(ctx => ({ ...req, url: ctx.request.provider })))
      .run(requestContext)
      .fork(
        err => {
          //unexpected url
          console.log(err);
          expect(err.toString()).toBe('RequestError: Error: Invalid URI "ip"');
          done();
        },
        res => {
          expect(res).toBeNull();
          done();
        }
      );
  });

  it("compose request", () => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        dafualt: "anything"
      },
      api: {}
    };

    const appContext = composeContext(httpConfig);

    const req: Request = {
      provider: "ip",
      url: "%(x)s",
      method: "GET"
    };

    const reqContext = appContext(req);

    const expected: GQLRequestContext = {
      config: {
        baseUrl: "https://httpbin.org",
        providers: { dafualt: "anything" },
        api: {}
      },
      gqlRequest: { root: {}, args: { x: "some" }, context: {}, meta: {} },
      request: { provider: "ip", url: "%(x)s", method: "GET" }
    };

    const actual = reqContext({}, { x: "some" }, {}, {});

    //console.log(actual);

    expect(expected).toEqual(actual);
  });
});
