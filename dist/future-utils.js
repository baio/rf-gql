"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var ramda_fantasy_1 = require("ramda-fantasy");
/**
 * Reader<Future<T>>
 */
exports.ReaderF = ramda_fantasy_1.Reader.T(ramda_fantasy_1.Future);
/**
* Given promise returns future.
*
* @param {Promise<any>} promise
* @returns {Future}
*/
exports.ofPromise = function (promise) {
    return ramda_1.pipe(ramda_1.flip, ramda_fantasy_1.Future)(promise.then.bind(promise));
};
/**
 * Given map function which accepts some arg and returns prmise, returns new reader future monad, with env og type arg
 *
 * @param {any} f
 */
exports.mapPromise = function (f) {
    return ramda_fantasy_1.Reader(ramda_1.compose(exports.ofPromise, f));
};
/**
 * Given reader and map function, run map function on env and then returns new reader with env from map result.
 * @param f
 */
exports.reshape = function (f) { return function (reader) {
    return ramda_fantasy_1.Reader(f).map(reader.run);
}; };
/**
 * Given future returns promise.
 *
 * @param {Future} future
 * @returns {Promise<any>}
 */
exports.toPromise = function (future) {
    return new Promise(function (res, rej) { return future.fork(rej, res); });
};
/**
 * Accepts Reader Future and function with some arguments.
 * Returns new function which accepts same arguments as f function and returns promise, which is converted from future
 * which obtained after reader runs with result reurned by original function f.
 * @param r
 */
exports.runReaderFP = function (r) { return function (f) { return ramda_1.compose(exports.toPromise, r.run, f); }; };
exports.ofReader = function (reader) {
    return exports.ReaderF.ask.map(reader.run);
};
