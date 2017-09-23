"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var req = require("request-promise-native");
var R = require("ramda");
var ramda_fantasy_1 = require("ramda-fantasy");
var future_utils_1 = require("./future-utils");
;
/**
 * Accepts request obj and retuns promise which run http request with resuest params.
 *
 * @param {Request} request
 */
exports.requestPromise = function (request) {
    console.log(">>> request", request);
    return req(request.url, {
        method: request.method,
        headers: request.headers,
        qs: request.qs,
        json: true,
        body: request.body
    })
        .then(function (res) {
        console.log(">>> response success", res);
        return res;
    }, function (err) {
        console.log(">>> response err", err);
        throw err;
    });
};
/**
 * Reader<Request, Future<any, any>>
*/
exports.request = future_utils_1.mapPromise(exports.requestPromise).map(ramda_fantasy_1.Future.cache);
var requestMethod = function (method) { return future_utils_1.reshape(R.merge({ method: method }))(exports.request); };
exports.get = requestMethod("GET");
exports.post = requestMethod("POST");
exports.put = requestMethod("PUT");
exports.patch = requestMethod("PATCH");
exports.del = requestMethod("DELETE");
