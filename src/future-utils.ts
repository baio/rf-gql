import { pipe, flip, compose } from "ramda";
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


export type MapPromiseFun<T, R> = ((x: T) =>  Promise<R>);
export type MapPromise<T, R> = (f: MapPromiseFun<T, R>) => ReaderF<T, R>;
export const mapPromise: (<T, R>(f: MapPromiseFun<T, R>) => ReaderF<T, R>) = f =>
  Reader(compose(future, f));

