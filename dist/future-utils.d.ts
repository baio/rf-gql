import { Reader, Future } from "ramda-fantasy";
/**
 * Reader<Future<T>>
 */
export declare const ReaderF: any;
export declare type ReaderF<T, R> = Reader<T, Future<R>>;
/**
* Given promise returns future.
*
* @param {Promise<any>} promise
* @returns {Future}
*/
export declare const ofPromise: (promise: Promise<any>) => any;
export declare type MapFun<T1, T2> = ((x: T1) => T2);
export declare type MapPromiseFun<T, R> = MapFun<T, Promise<R>>;
export declare type MapPromise<T, R> = (f: MapPromiseFun<T, R>) => ReaderF<T, R>;
/**
 * Given map function which accepts some arg and returns prmise, returns new reader future monad, with env og type arg
 *
 * @param {any} f
 */
export declare const mapPromise: (<T, R>(f: MapPromiseFun<T, R>) => ReaderF<T, R>);
/**
 * Given reader and map function, run map function on env and then returns new reader with env from map result.
 * @param f
 */
export declare const reshape: <T1, T2>(f: (x: T1) => T2) => (reader: any) => any;
/**
 * Given future returns promise.
 *
 * @param {Future} future
 * @returns {Promise<any>}
 */
export declare const toPromise: (future: any) => Promise<any>;
export declare type Fun<T> = (...args) => T;
export declare type RunReaderFP<E, R> = (r: ReaderF<E, R>) => (f: Fun<E>) => (...args) => Promise<R>;
/**
 * Accepts Reader Future and function with some arguments.
 * Returns new function which accepts same arguments as f function and returns promise, which is converted from future
 * which obtained after reader runs with result reurned by original function f.
 * @param r
 */
export declare const runReaderFP: RunReaderFP<any, any>;
export declare const ofReader: <E, R>(reader: any) => any;
