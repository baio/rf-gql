"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
exports.logt = function (t) { return ramda_1.tap(function (x) { return console.log(t, x); }); };
exports.log = ramda_1.tap(console.log);
exports.mapObj = function (f) { return ramda_1.pipe(ramda_1.toPairs, f, ramda_1.fromPairs); };
exports.cleanObj = exports.mapObj(ramda_1.reject(function (_a) {
    var k = _a[0], v = _a[1];
    return ramda_1.isNil(v);
}));
exports.fmerge = ramda_1.flip(ramda_1.merge);
