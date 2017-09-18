"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_fantasy_1 = require("ramda-fantasy");
var future_utils_1 = require("./future-utils");
var graphql_1 = require("./graphql");
var http_1 = require("./http");
var R = require("ramda");
describe("graphql", function () {
    it("map gql2request (qs & heders)", function () {
        var httpConfig = {
            baseUrl: "https://httpbin.org",
            providers: {
                ip: "ip",
                uuid: "uuid"
            },
            api: {
                getHeaders: function (ctx) { return ({ token: ctx.context.token, none: undefined }); }
            }
        };
        var requestContext = {
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
        var expected = {
            url: "https://httpbin.org/ip",
            method: "GET",
            headers: { token: "lol" },
            qs: { filter: "zzz" }
        };
        var actual = graphql_1.gql2request.run(requestContext);
        expect(actual).toEqual(expected);
    });
    it("run request from graphql context", function (done) {
        var httpConfig = {
            baseUrl: "https://httpbin.org",
            providers: {
                ip: "ip",
                uuid: "uuid"
            },
            api: {}
        };
        var requestContext = {
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
        graphql_1.gql2request
            .map(http_1.request.run)
            .run(requestContext)
            .fork(function (err) {
            expect(err).toBeNull();
            done();
        }, function (res) {
            expect(res).toBeTruthy();
            done();
        });
    });
    xit("run request from graphql context + mapping", function (done) {
        var httpConfig = {
            baseUrl: "https://httpbin.org",
            providers: {
                ip: "ip",
                uuid: "uuid"
            },
            api: {}
        };
        var requestContext = {
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
        ramda_fantasy_1.Reader(function (ctx) { return ramda_fantasy_1.Future.of(__assign({}, ctx, { url: ctx["request"].provider })); })
            .chain(graphql_1.requestF)
            .run(requestContext)
            .fork(function (err) {
            //unexpected url
            console.log(err);
            expect(err.toString()).toBe('RequestError: Error: Invalid URI "ip"');
            done();
        }, function (res) {
            expect(res).toBeNull();
            done();
        });
    });
    it("compose request", function () {
        var httpConfig = {
            baseUrl: "https://httpbin.org",
            providers: {
                dafualt: "anything"
            },
            api: {}
        };
        var appContext = graphql_1.composeContext(httpConfig);
        var req = ramda_fantasy_1.Reader.of({
            provider: "ip",
            url: "%(x)s",
            method: "GET"
        });
        var reqContext = appContext(req);
        var expected = {
            config: {
                baseUrl: "https://httpbin.org",
                providers: { dafualt: "anything" },
                api: {}
            },
            gqlRequest: { root: {}, args: { x: "some" }, context: {}, meta: {} },
            request: { provider: "ip", url: "%(x)s", method: "GET" }
        };
        var actual = reqContext({}, { x: "some" }, {}, {});
        expect(expected).toEqual(actual);
    });
    it("map gql request to request", function (done) {
        var httpConfig = {
            baseUrl: "https://httpbin.org",
            providers: {
                default: "anything"
            },
            api: {}
        };
        var appContext = graphql_1.composeContext(httpConfig);
        var req = ramda_fantasy_1.Reader.of({
            provider: "default",
            url: "%(x)s",
            method: "GET"
        });
        var reqContext = appContext(req);
        var handler = R.compose(graphql_1.requestF.run, reqContext);
        handler({}, { x: "some" }, {}, {}).fork(function (err) {
            expect(err).toBeNull();
            done();
        }, function (res) {
            expect(res).toBeTruthy();
            done();
        });
        //console.log(actual);
    });
    it("map gql request to request", function (done) {
        var httpConfig = {
            baseUrl: "https://httpbin.org",
            providers: {
                default: "anything"
            },
            api: {}
        };
        //req -> (a,..,d) -> GQLRequestContext
        var appReq = graphql_1.composeContext(httpConfig);
        var req = ramda_fantasy_1.Reader.of({
            provider: "default",
            url: "%(x)s",
            method: "GET"
        });
        var handlerReq = appReq(req);
        var handler = future_utils_1.runReaderFP(graphql_1.requestF)(handlerReq);
        handler({}, { x: "some" }, {}, {}).then(function (res) {
            expect(res).toBeTruthy();
            done();
        }, function (err) {
            expect(err).toBeNull();
            done();
        });
        //console.log(actual);
    });
    it("map gql request to request (post)", function (done) {
        var httpConfig = {
            baseUrl: "https://httpbin.org",
            providers: {
                default: "post"
            },
            api: {
                getHeaders: function () { return ({ header1: "lol" }); }
            }
        };
        //req -> (a,..,d) -> GQLRequestContext
        var appReq = graphql_1.composeContext(httpConfig);
        var req = ramda_fantasy_1.Reader.of({
            provider: "default",
            url: "",
            method: "POST",
            headers: { header2: "kek" },
            body: "tfw"
        });
        var handlerReq = appReq(req);
        var handler = future_utils_1.runReaderFP(graphql_1.requestF)(handlerReq);
        handler({}, {}, {}, {}).then(function (res) {
            expect(res).toBeTruthy();
            done();
        }, function (err) {
            expect(err).toBeNull();
            done();
        });
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
