import { request, Request, get, RequestGet } from "./http";

describe("http", () => {

  it("request google (via request)", done => {
    const req: Request = {
      method: "GET",
      url: "https://httpbin.org/ip"
    };

    request.run(req).fork(
      err => {
        expect(err).toBeNull();
        done();
      },
      res => {
        expect(res).toBeTruthy();
        done();
      }
    );
  });

  it("request google (via get)", done => {
    const req: RequestGet = {
      url: "https://httpbin.org/ip"
    };

    get.run(req).fork(
      err => {
        expect(err).toBeNull();
        done();
      },
      res => {
        expect(res).toBeTruthy();
        done();
      }
    );
  });

});
