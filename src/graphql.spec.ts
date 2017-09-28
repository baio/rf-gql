import { Reader, Future } from "ramda-fantasy";
import { runReaderFP } from "./future-utils";
import {
  gql2request,
  GQLRequestContext,
  HttpConfig,
  requestF,
  Request,
  composeContext,
  GQLRequest,
  resolver,
  createResolver,
  gqlHttpRequest,
  gqlMockRequest,
  createMockResolver,
  createHttpResolver,
  chainRequest,
  LogArgs,
  composeResover,
  runRequest,
  mutateAskArgs,
  chainResult
} from "./graphql";
import { request, Request as HttpRequest } from "./http";
import { log, fmerge } from "./utils";
import { ReaderF } from "./future-utils";
import * as R from "ramda";

const mockConfig = (f): HttpConfig => ({
  baseUrl: "",
  providers: {
    HTTPBIN: "https://httpbin.org"
  },
  api: {
    request: ReaderF.ask.map(f),
    getHeaders: (context: GQLRequest) => ({}),
    log: (args: LogArgs, ctx: GQLRequestContext, obj) => {
      console.log("log >>>", args, "\n", ctx, "\n", obj);
    }
  }
});

const httpConfig : HttpConfig = ({
  baseUrl: "",
  providers: {
    HTTPBIN: "https://httpbin.org"
  },
  api: {
    request: request,
    getHeaders: (context: GQLRequest) => ({}),
    log: (args: LogArgs, ctx: GQLRequestContext, obj) => {
      console.log("log >>>", args, "\n", ctx, "\n", obj);
    }
  }
});

const stampResolverSession = x => ({...x, resolverSession : {id: Math.random()}});

const mockResolver = R.compose(composeResover, mockConfig);
const httpResolver = composeResover(httpConfig);

describe("graphql", () => {
  it("resolver", () => {
    const f = req => {
      if (req.url === "https://httpbin.org/uuid") {
        return { uuid: "100" };
      } else {
        ``;
        return null;
      }
    };

    //
    const request = {
      url: "uuid",
      method: "GET",
      provider: "HTTPBIN"
    };

    //gqlRequestContext proto -> GqlRequestContext
    const reqContext = R.merge({ request });

    //Reader GqlRequestContext (Future  Result)
    const reqF = runRequest;

    //gqlRequestContext proto -> Future Result
    const rF = R.compose(reqF.run, reqContext, stampResolverSession);

    mockResolver(f)(rF)({}, {}, {}, {}).then(
      res => expect(res).toEqual({ uuid: "100" }),
      err => expect(err).toBeUndefined()
    );
  });

  it("chainable resolver", () => {

    const f = req => {
      if (req.url === "https://httpbin.org/uuid") {
        return { uuid: "100" };
      }
      else if (req.url === "https://httpbin.org/anything/100") {
        return "300";
      }
      else {
        return null;
      }
    };

    //request anithing

    const request2 = ctx => ({
      url: "anything/" + ctx.gqlRequest.args.id,
      method: "GET",
      provider: "HTTPBIN"
    });

    //gqlRequestContext proto -> GqlRequestContext
    const reqContext2 = x => {
      return R.merge(x, {
        request: request2(x)
      });
    }

    //Reader GqlRequestContext (Future  Result)
    const reqF2 = runRequest;

    //gqlRequestContext proto -> Future Result
    const rF2 = R.compose(reqF2.run, reqContext2, stampResolverSession);

    //request uuid

    const request = {
      url: "uuid",
      method: "GET",
      provider: "HTTPBIN"
    };

    //gqlRequestContext proto -> GqlRequestContext
    const reqContext = R.merge({ request });

    const res2args = x => ({ id : x.uuid });

    //Reader GqlRequestContext (Future  Result)
    const reqF = runRequest.chain(chainResult(res2args)(rF2));

    //gqlRequestContext proto -> Future Result
    const rF = R.compose(reqF.run, reqContext, stampResolverSession);

    mockResolver(f)(rF)({}, {}, {}, {}).then(
      res => expect(res).toEqual( "300" ),
      err => expect(err).toBeUndefined()
    );

  });

  it("http resolver", done => {

    //
    const request = {
      url: "uuid",
      method: "GET",
      provider: "HTTPBIN"
    };

    //gqlRequestContext proto -> GqlRequestContext
    const reqContext = R.merge({ request });

    //Reader GqlRequestContext (Future  Result)
    const reqF = runRequest;

    //gqlRequestContext proto -> Future Result
    const rF = R.compose(reqF.run, reqContext, stampResolverSession);

    httpResolver(rF)({}, {}, {}, {}).then(
      res => { expect(res.uuid).toBeTruthy(); done() },
      err => { expect(err).toBeUndefined(); done(); }
    );
  });

  it("http chainable resolver", done => {

        //request anithing

        const request2 = ctx => ({
          url: "anything/" + ctx.gqlRequest.args.id,
          method: "GET",
          provider: "HTTPBIN"
        });

        //gqlRequestContext proto -> GqlRequestContext
        const reqContext2 = x => {
          return R.merge(x, {
            request: request2(x)
          });
        }

        //Reader GqlRequestContext (Future Result)
        const reqF2 = runRequest;

        //gqlRequestContext proto -> Future Result
        const rF2 = R.compose(reqF2.run, reqContext2, stampResolverSession);

        //request uuid

        const request = {
          url: "uuid",
          method: "GET",
          provider: "HTTPBIN"
        };

        //gqlRequestContext proto -> GqlRequestContext
        const reqContext = R.merge({ request });

        const res2args = x => ({ id : x.uuid });

        //Reader GqlRequestContext (Future  Result)
        const reqF = runRequest.chain(chainResult(res2args)(rF2));

        //gqlRequestContext proto -> Future Result
        const rF = R.compose(reqF.run, reqContext, stampResolverSession);

        httpResolver(rF)({}, {}, {}, {}).then(
          res => { expect(res.url).toBeTruthy(); done(); },
          err => { expect(err).toBeUndefined(); done(); }
        );

      });

  it("createTestResolver", () => {
    const f = req => {
      if (req.url === "http://xxx.ru/api/references/team-member-roles") {
        return [];
      } else {
        ``;
        return null;
      }
    };

    const reqF = ReaderF.ask.map(gqlRequest => ({
      config: { providers: { ACADEMIC_TERMS_PLANNING_SERVICE: "http://xxx.ru" }, api: {} },
      request: {
        url: `api/references/team-member-roles`,
        method: "GET",
        provider: "ACADEMIC_TERMS_PLANNING_SERVICE"
      },
      gqlRequest
    }));

    const resolver = createResolver(null)(reqF.chain(gqlMockRequest(f)));

    resolver({}, {}, {}, {}).then(res => expect(res).toEqual([]));
  });

  it("createHttpResolver", () => {
    const reqF = ReaderF.ask.map(gqlRequest => ({
      config: { providers: { ACADEMIC_TERMS_PLANNING_SERVICE: "https://httpbin.org" }, api: {} },
      request: {
        url: `uuid`,
        method: "GET",
        provider: "ACADEMIC_TERMS_PLANNING_SERVICE"
      },
      gqlRequest
    }));

    const resolver = createResolver(null)(reqF.chain(gqlHttpRequest));

    resolver({}, {}, {}, {}).then(res => expect(res.uuid).toBeTruthy());
  });

  xit("createHttpResolver 2", () => {
    const reqF = ReaderF.ask
      .map(gqlRequest => ({
        config: { providers: { ACADEMIC_TERMS_PLANNING_SERVICE: "https://httpbin.org" }, api: {} },
        request: {
          url: `uuid`,
          method: "GET",
          provider: "ACADEMIC_TERMS_PLANNING_SERVICE"
        },
        gqlRequest
      }))
      .chain(chainRequest);

    const resolver = createHttpResolver(reqF);

    resolver({}, {}, {}, {}).then(res => expect(res.uuid).toBeTruthy());
  });

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
      },
      resolverSession: { id: "1" }
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
      },
      resolverSession: { id: "1" }
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
      },
      resolverSession: { id: "1" }
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

  xit("compose request", () => {
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
      gqlRequest: { root: {}, args: { x: "some" }, context: {}, meta: {}, httpRequest: null },
      request: { provider: "ip", url: "%(x)s", method: "GET" },
      resolverSession: { id: "1" }
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
        getHeaders: () => ({ header1: "lol" })
      }
    };

    //req -> (a,..,d) -> GQLRequestContext
    const appReq = composeContext(httpConfig);

    const req = Reader.of(<Request>{
      provider: "default",
      url: "",
      method: "POST",
      headers: { header2: "kek" },
      body: "tfw"
    });

    const handlerReq = appReq(req);

    const handler = runReaderFP(requestF)(handlerReq);

    handler({}, {}, {}, {}).then(
      res => {
        console.log(res);
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

  it("post request with empty response must be handled", () => {
    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        default: "post"
      },
      api: {
        getHeaders: () => ({ header1: "lol" })
      }
    };

    //req -> (a,..,d) -> GQLRequestContext
    const appReq = composeContext(httpConfig);

    const req = Reader.of(<Request>{
      provider: "default",
      url: "",
      method: "POST",
      headers: { header2: "kek" },
      body: "tfw"
    });

    const handlerReq = appReq(req);

    //always empty response
    //const testRequestF = ReaderF(req => Future((rej, res) => res(req)));
    //^^^ this the same ???
    const testRequestF = Reader.of(Future((rej, res) => res()));

    const handler = runReaderFP(testRequestF)(handlerReq);

    handler({}, {}, {}, {}).then(
      res => {
        expect(res).toBeUndefined();
      },
      err => {
        expect(err).toBeNull();
      }
    );
  });
});
