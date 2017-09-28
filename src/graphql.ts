import * as urlJoin from "url-join";
import { request as requestN } from "request-promise-native";
import { sprintf } from "sprintf-js";
import { cleanObj } from "./utils";
import * as R from "ramda";
import { Reader, Future } from "ramda-fantasy";
import { ofPromise, ReaderF, MapFun, toPromise, runReaderFP, ofReader, mutateAsk } from "./future-utils";
import { request, RequestMethods } from "./http";
import { make as makeWord } from "sentencer";

export type RequestF = ReaderF<Request, any>;
export interface GQLRequest {
  root: { [key: string]: any };
  args: { [key: string]: any };
  context: { [key: string]: any };
  meta: any;
  //@obsolete
  httpRequest?: any | null;
}

export interface Request {
  provider: string;
  method: RequestMethods;
  url: string;
  qs?: { [key: string]: any } | null;
  headers?: { [key: string]: any } | null;
}

export interface HttpConfig {
  //common base url for all requests
  baseUrl: string;
  //mapping [service name] -> url
  providers: { [key: string]: string };
  // requests middleware
  api: HttpApi;
}

export interface ResolverSession {
  id: string;
}

export interface LogArgs {
  label: string;
  marker?: string | null;
  //npm levels  error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5
  level: "debug" | "error" | "warn" | "info" | "verbose" | "debug" | "silly";
}

export interface HttpApi {
  request?: ReaderF<Request, any> | null;
  getHeaders?: (request: GQLRequest) => { [key: string]: string };
  log?: (args: LogArgs, ctx: GQLRequestContext, obj: any) => void;
}

export interface GQLRequestContext {
  //provider name, see config.providers
  config: HttpConfig;
  request: Request;
  gqlRequest: GQLRequest;
  resolverSession: ResolverSession;
}

export const log = (args: LogArgs, ctx) => obj => {
  if (ctx.config.api.log) {
    ctx.config.api.log(args, ctx, obj);
  }
  return obj;
};

export const logF = (args: LogArgs) => mF => mF.chain(obj => Reader.of(ReaderF.ask.map(ctx => log(args, ctx)(obj))));

const makeMarker = () => makeWord("{{adjective}} {{noun}}");

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
const getRequestHeaders = ({ config: { api: { getHeaders } }, gqlRequest, request: { headers } }: GQLRequestContext) =>
  cleanObj({
    ...getHeaders ? getHeaders(gqlRequest) : {},
    ...headers
  });

export const gql2request: Reader<GQLRequestContext, Request> = Reader.of(body => qs => method => url => headers =>
  cleanObj({ url, headers, qs, method, body })
)
  .ap(Reader(R.path(["request", "body"])))
  .ap(Reader(R.path(["request", "qs"])))
  .ap(Reader(R.path(["request", "method"])))
  .ap(Reader(getRequestUrl))
  .ap(Reader(getRequestHeaders));

export const mapReaderF = R.pipe(
  mutateAsk(gql2request.run)
);

export const requestF = mapReaderF<Future<any, any>>(request);

export const createGQLRequestContext = (config: HttpConfig) => (request: Request) => (
  gqlRequest: GQLRequest
): GQLRequestContext => ({ config, gqlRequest, request, resolverSession: null });

export const createGQLRequest = (httpRequest: RequestF) => (root, args, context, meta): GQLRequest => ({
  root,
  args,
  context,
  meta,
  httpRequest
});

export const composeGQLRequest = (root, args, context, meta): GQLRequest => ({ root, args, context, meta });

export type ComposeContext = (
  config: HttpConfig
) => (request: Reader<GQLRequest, Request>) => (root, args, context, meta) => GQLRequestContext;
export const composeContext: ComposeContext = (config: HttpConfig) => (
  request: Reader<GQLRequest, Request> //(root, args, context, meta) =>
) => R.compose(x => createGQLRequestContext(config)(request.run(x))(x), createGQLRequest(null));

export type Resolver = (
  httpConfig: HttpConfig
) => (
  req: Reader<GQLRequest, Request>
) => <R>(reader: ReaderF<GQLRequestContext, R>) => (root, args, context, meta) => Promise<R>;
export const resolver: Resolver = httpConfig => req => readerF => runReaderFP(readerF)(composeContext(httpConfig)(req));

//gql
export const mutateAskArgs = f => mutateAsk(R.evolve({ args: f, root: R.always({}), meta: R.always({}) }));

const mutateGql2Request = readerF => gqlContext => mutateAsk(_ => gql2request.run(gqlContext))(readerF);

//gql
export const gqlHttpRequest = mutateGql2Request(request);

export const gqlMockRequest = f => mutateGql2Request(ReaderF.ask.map(f));

export const createResolver = req => reader => R.compose(toPromise, reader.run, createGQLRequest(req));

export const createHttpResolver = createResolver(request);

export const createMockResolver = f => createResolver(ReaderF.ask.map(f));

export const chainRequest = (gqlRequestContext: GQLRequestContext) => {
  //TODO:
  if (!gqlRequestContext.config.api.request) {
    throw new Error("chainHttpRequest::gqlRequestContext.config.api.request not defined!");
  }
  return mapReaderF(gqlRequestContext.gqlRequest.httpRequest);
  //return Reader.of(gqlRequestContext.gqlRequest.httpRequest.run(gql2request.run(gqlRequestContext)));
};

export const runRequest = ReaderF.ask.chain((gqlRequestContext: GQLRequestContext) => {
  //TODO:
  if (!gqlRequestContext.config.api.request) {
    throw new Error("chainHttpRequest::gqlRequestContext.config.api.request not defined!");
  }

  const marker = makeMarker();

  const logArgs = (x): LogArgs => ({
    level: "verbose",
    label: "runRequest:" + x,
    marker
  });

  const lg = x => log(logArgs(x), gqlRequestContext);

  return Reader.of(
    ReaderF.ask
      .map(lg("start"))
      .chain(_ => gqlRequestContext.config.api.request)
      .map(lg("success"))
      .run(gql2request.run(gqlRequestContext))
  );

});

export const composeResover = config => ffut =>
  R.compose(toPromise, ffut, gqlRequest => ({ config, gqlRequest }), composeGQLRequest);

export const updGqlRequest = R.curry((f,  ctx, x) => ({
  ...ctx,
  gqlRequest: {
    root: {},
    args: f(x),
    context: ctx.gqlRequest.context,
    meta: {}
  }
}));

export const setGqlRequest = R.curry((a, ctx) => updGqlRequest(R.always(a), ctx, null));

export const chainResult = f => rF => res => ReaderF.ask.chain(ctx => Reader.of(rF(updGqlRequest(f, ctx, res))));
