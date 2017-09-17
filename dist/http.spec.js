"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("./http");
describe("http", function () {
    it("request google (via request)", function (done) {
        var req = {
            method: "GET",
            url: "https://httpbin.org/ip"
        };
        http_1.request.run(req).fork(function (err) {
            expect(err).toBeNull();
            done();
        }, function (res) {
            expect(res).toBeTruthy();
            done();
        });
    });
    it("request google (via get)", function (done) {
        var req = {
            url: "https://httpbin.org/ip"
        };
        http_1.get.run(req).fork(function (err) {
            expect(err).toBeNull();
            done();
        }, function (res) {
            expect(res).toBeTruthy();
            done();
        });
    });
});
