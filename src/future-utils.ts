import { pipe, flip, compose, curry } from "ramda";
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
export const future = (promise: Promise<any>) : Future =>
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
  Reader(compose(future, f));
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

