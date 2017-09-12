import { mapPromise } from "./future-utils";

describe("future-utils", () => {
  it("mapPromise true", () => {
    const f = args => new Promise(res => res(args));

    mapPromise(f)
      .run(true)
      .fork(
        err => {
          expect(err).toBeNull();
        },
        res => {
          expect(res).toEqual(true);
        }
      );
  });

  it("mapPromise false", () => {
    const f = args => new Promise(res => res(args));

    mapPromise(f)
      .run(false)
      .fork(
        err => {
          expect(err).toBeNull();
        },
        res => {
          expect(res).toEqual(false);
        }
      );
  });

  it("mapPromise reject", () => {
    const f = args => new Promise((_, rej) => rej(args));

    mapPromise(f)
      .run(false)
      .fork(
        err => {
          expect(err).toEqual(false);
        },
        res => {
          expect(res).toBeNull();
        }
      );
  });
});
