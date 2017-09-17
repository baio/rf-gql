"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var future_utils_1 = require("./future-utils");
describe("future-utils", function () {
    it("mapPromise true", function () {
        var f = function (args) { return new Promise(function (res) { return res(args); }); };
        future_utils_1.mapPromise(f)
            .run(true)
            .fork(function (err) {
            expect(err).toBeNull();
        }, function (res) {
            expect(res).toEqual(true);
        });
    });
    it("mapPromise false", function () {
        var f = function (args) { return new Promise(function (res) { return res(args); }); };
        future_utils_1.mapPromise(f)
            .run(false)
            .fork(function (err) {
            expect(err).toBeNull();
        }, function (res) {
            expect(res).toEqual(false);
        });
    });
    it("mapPromise reject", function () {
        var f = function (args) { return new Promise(function (_, rej) { return rej(args); }); };
        future_utils_1.mapPromise(f)
            .run(false)
            .fork(function (err) {
            expect(err).toEqual(false);
        }, function (res) {
            expect(res).toBeNull();
        });
    });
});
