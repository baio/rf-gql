import { pipe, flip, compose, curry, prop, memoize } from "ramda";
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
export const ofPromise = (promise: Promise<any>) : Future =>
  //Future((res, rej) => promise.then(rej, res));
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
  Reader(compose(ofPromise, f));
/**
 * Given reader and map function, run map function on env and then returns new reader with env from map result.
 * @param f
 */
/*
export const reshape = <T1, T2>(f: MapFun<T1, T2>) => (reader: Reader<T1>) : Reader<T2> =>
  Reader(f).map(reader.run);
*/

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

export const ofReader = <E, R>(reader: Reader<E, R>): ReaderF<E, R> =>
  ReaderF.ask.map(reader.run);

export const mutateAsk = <T1, T2>(f: MapFun<T1, T2>) => (reader: Reader<T1>) : Reader<T1> =>
  ReaderF(pipe(f, reader.run));

ReaderF.prototype.chainReject = function (f: MapFun<any, any>) {
  const m = this;
  return ReaderF(ctx => m.run(ctx).chainReject(f));
}

const memoizeSingle = f => fun => {
  let memo: [any, any]|null;
  return (x) => {
    const rf = f(x);
    if (memo && memo[0] === rf) {
      return memo[1];
    } else {
      let res = fun(x);
      memo = [rf, res];
      return res;
    }
  }
}

export const cacheRF = <E, T>(f: ((x: E) => any)) => (rf: ReaderF<E, T>): ReaderF<E, T> => ReaderF(
  memoizeSingle(f)(context =>
    Future.cache(rf.run(context))
  )
);


