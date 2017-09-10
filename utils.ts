import { prop, flatten, join, tap, pipe, not, isNil, flip, assocPath, curry, toPairs, fromPairs, reject, zipObj } from "ramda";

export const logt = t => tap(x => console.log(t, x));
export const log = tap(console.log);

export const mapObj = f => pipe(toPairs, f, fromPairs);
export const cleanObj = mapObj(reject(([k, v]) => isNil(v)))
