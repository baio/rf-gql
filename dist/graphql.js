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
var urlJoin = require("url-join");
var sprintf_js_1 = require("sprintf-js");
var utils_1 = require("./utils");
var R = require("ramda");
var ramda_fantasy_1 = require("ramda-fantasy");
var future_utils_1 = require("./future-utils");
var http_1 = require("./http");
/**
 * Remove empty paths from joined strings and then join rest.
 *
 * @param {...string[]} paths
 */
var join = function () {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    return urlJoin.apply(void 0, paths.filter(function (f) { return f; }));
};
/**
 * Given urlPattern and request args, format pattern with fields from args.
 *
 * @param {GQLRequestContext} `{request: {urlPattern, args}}`
 * @returns {string}
 */
var getRequestUrl = function (_a) {
    var _b = _a.request, provider = _b.provider, url = _b.url, args = _a.gqlRequest.args, _c = _a.config, baseUrl = _c.baseUrl, providers = _c.providers;
    return join(baseUrl, providers[provider], sprintf_js_1.sprintf(url, R.merge({}, args)));
};
/**
 * Invoke api.getHeaders with request param
 *
 * @param {GQLRequestContext} {api: {getHeaders}, request}
 */
var getRequestHeaders = function (_a) {
    var getHeaders = _a.config.api.getHeaders, gqlRequest = _a.gqlRequest, headers = _a.request.headers;
    return utils_1.cleanObj(__assign({}, getHeaders ? getHeaders(gqlRequest) : {}, headers));
};
exports.gql2request = ramda_fantasy_1.Reader.of(function (body) { return function (qs) { return function (method) { return function (url) { return function (headers) { return utils_1.cleanObj({ url: url, headers: headers, qs: qs, method: method, body: body }); }; }; }; }; })
    .ap(ramda_fantasy_1.Reader(R.path(["request", "body"])))
    .ap(ramda_fantasy_1.Reader(R.path(["request", "qs"])))
    .ap(ramda_fantasy_1.Reader(R.path(["request", "method"])))
    .ap(ramda_fantasy_1.Reader(getRequestUrl))
    .ap(ramda_fantasy_1.Reader(getRequestHeaders));
exports.mapReaderF = function (r) { return future_utils_1.ofReader(exports.gql2request).chain(R.compose(ramda_fantasy_1.Reader.of, r.run)); };
exports.requestF = exports.mapReaderF(http_1.request);
exports.createGQLRequestContext = function (config) { return function (request) { return function (gqlRequest) {
    return ({ config: config, gqlRequest: gqlRequest, request: request });
}; }; };
exports.createGQLRequest = function (root, args, context, meta) { return ({ root: root, args: args, context: context, meta: meta }); };
exports.composeContext = function (config) { return function (request) {
    return R.compose(function (x) { return exports.createGQLRequestContext(config)(request.run(x))(x); }, exports.createGQLRequest);
}; };
exports.resolver = function (httpConfig) { return function (req) { return function (readerF) {
    return future_utils_1.runReaderFP(readerF)(exports.composeContext(httpConfig)(req));
}; }; };
