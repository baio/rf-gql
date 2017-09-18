import { Reader, Future } from "ramda-fantasy";
import { reshape, runReaderFP } from "./future-utils";
import {
  gql2request,
  GQLRequestContext,
  HttpConfig,
  requestF,
  Request,
  composeContext,
  GQLRequest,
  resolver
} from "./graphql";
import { request, Request as HttpRequest } from "./http";
import { log, fmerge } from "./utils";
import * as R from "ramda";

describe("graphql", () => {
  it("map gql2request (qs & heders)", () => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        ip: "ip",
        uuid: "uuid"
      },
      api: {
        getHeaders: ctx => ({ token: ctx.context.token, none: undefined })
      }
    };

    const requestContext: GQLRequestContext = {
      config: httpConfig,
      request: {
        provider: "ip",
        url: "",
        method: "GET",
        qs: { filter: "zzz" }
      },
      gqlRequest: {
        root: {},
        args: {},
        context: { token: "lol" },
        meta: {}
      }
    };

    const expected: HttpRequest = {
      url: "https://httpbin.org/ip",
      method: "GET",
      headers: { token: "lol" },
      qs: { filter: "zzz" }
    };

    const actual = gql2request.run(requestContext);

    expect(actual).toEqual(expected);
  });

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

  xit("run request from graphql context + mapping", done => {
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

    //TODO:!!!
    Reader(ctx => Future.of({ ...ctx, url: ctx["request"].provider }))
      .chain(requestF)
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

    const req = Reader.of(<Request>{
      provider: "ip",
      url: "%(x)s",
      method: "GET"
    });

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

    expect(expected).toEqual(actual);
  });

  it("map gql request to request", done => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        default: "anything"
      },
      api: {}
    };

    const appContext = composeContext(httpConfig);

    const req = Reader.of(<Request>{
      provider: "default",
      url: "%(x)s",
      method: "GET"
    });

    const reqContext = appContext(req);

    const handler = R.compose(requestF.run, reqContext);

    handler({}, { x: "some" }, {}, {}).fork(
      err => {
        expect(err).toBeNull();
        done();
      },
      res => {
        expect(res).toBeTruthy();
        done();
      }
    );

    //console.log(actual);
  });

  it("map gql request to request", done => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        default: "anything"
      },
      api: {}
    };

    //req -> (a,..,d) -> GQLRequestContext
    const appReq = composeContext(httpConfig);

    const req = Reader.of(<Request>{
      provider: "default",
      url: "%(x)s",
      method: "GET"
    });

    const handlerReq = appReq(req);

    const handler = runReaderFP(requestF)(handlerReq);

    handler({}, { x: "some" }, {}, {}).then(
      res => {
        expect(res).toBeTruthy();
        done();
      },
      err => {
        expect(err).toBeNull();
        done();
      }
    );

    //console.log(actual);
  });

  it("map gql request to request (post)", done => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        default: "post"
      },
      api: {
        getHeaders:() => ({header1: "lol"})
      }
    };

    //req -> (a,..,d) -> GQLRequestContext
    const appReq = composeContext(httpConfig);

    const req = Reader.of(<Request>{
      provider: "default",
      url: "",
      method: "POST",
      headers: {header2: "kek"},
      body: "tfw"
    });

    const handlerReq = appReq(req);

    const handler = runReaderFP(requestF)(handlerReq);

    handler({}, { }, {}, {}).then(
      res => {
        expect(res).toBeTruthy();
        done();
      },
      err => {
        expect(err).toBeNull();
        done();
      }
    );

    //console.log(actual);
  });

  /*
  xit("handler", done => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        default: "anything"
      },
      api: {}
    };

    //req -> (a,..,d) -> GQLRequestContext
    const appHandler = resolver(httpConfig);

    const req = Reader.of(<Request>{
      provider: "default",
      url: "%(x)s",
      method: "GET"
    });

    const mapResult = context => res => context.gqlRequest.args.x + "=" + res.url;
    const reqF = askRF(mapResult)(requestF);

    const requestHandler = appHandler(req)(reqF);

    requestHandler({}, { x: "some" }, {}, {}).then(
      res => {
        expect(res).toEqual("some=https://httpbin.org/anything/some");
        done();
      },
      err => {
        expect(err).toBeNull();
        done();
      }
    );

    //console.log(actual);
  });
  */
});
