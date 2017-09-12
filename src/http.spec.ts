import { request, Request, get, RequestGet } from "./http";

describe("http", () => {

  it("request google (via request)", done => {
    const req: Request = {
      method: "GET",
      url: "http://google.com"
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
      url: "http://google.com"
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
