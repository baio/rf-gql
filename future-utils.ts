import { pipe, flip } from "ramda";
import { Reader, Future } from "ramda-fantasy";

/**
 * Reader<Future<T>>
 */
export const FutureReader = Reader.T(Future);
export type FutureReader<T, R> = Reader<T, Future<R>>;

 /**
* Given promise returns future.
*
* @param {Promise<any>} promise
* @returns {Future}
*/
export const future = (promise: Promise<any>) : Future =>
 pipe(flip, Future)(promise.then.bind(promise));


