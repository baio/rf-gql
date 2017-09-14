import { pipe, flip, compose, curry, prop } from "ramda";
import { Reader, Future } from "ramda-fantasy";

/**
 * Reader<Future<T>>
 */
export const ReaderF = Reader.T(Future);
export type ReaderF<T, R> = Reader<T, Future<R>>;

 /**
* Given promise returns future.
*
* @param {Promise<any>} promise
* @returns {Future}
*/
export const fromPromise = (promise: Promise<any>) : Future =>
 pipe(flip, Future)(promise.then.bind(promise));

export type MapFun<T1, T2> = ((x: T1) =>  T2);
export type MapPromiseFun<T, R> = MapFun<T, Promise<R>>;
export type MapPromise<T, R> = (f: MapPromiseFun<T, R>) => ReaderF<T, R>;
/**
 * Given map function which accepts some arg and returns prmise, returns new reader future monad, with env og type arg
 *
 * @param {any} f
 */
export const mapPromise: (<T, R>(f: MapPromiseFun<T, R>) => ReaderF<T, R>) = f =>
  Reader(compose(fromPromise, f));
/**
 * Given reader and map function, run map function on env and then returns new reader with env from map result.
 * @param f
 */
export const reshape = <T1, T2>(f: MapFun<T1, T2>) => (reader: Reader<T1>) : Reader<T2> =>
  Reader(f).map(reader.run);

/**
 * Given future returns promise.
 *
 * @param {Future} future
 * @returns {Promise<any>}
 */
export const toPromise = (future: Future) : Promise<any> =>
  new Promise((res, rej) => future.fork(rej, res));

export type Fun<T> = (...args) => T;
export type RunReaderFP<E, R> = (r: ReaderF<E, R>) => (f: Fun<E>) => (...args) => Promise<R>;
/**
 * Accepts Reader Future and function with some arguments.
 * Returns new function which accepts same arguments as f function and returns promise, which is converted from future
 * which obtained after reader runs with result reurned by original function f.
 * @param r
 */
export const runReaderFP: RunReaderFP<any, any> = r => f => compose(toPromise, r.run, f);

export const askRF = <T1, T2, T3>(f: MapFun<T1, MapFun<T2, T3>>) =>  <T1,T2>(reader: ReaderF<T1,T2>) : ReaderF<T1,T3> =>
  reader.chain(fut => Reader(compose(fut.map.bind(fut), f)));

