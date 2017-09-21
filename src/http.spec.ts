import { request, Request, get, RequestGet, RequestPost, post } from "./http";

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

  it("request post with empty response", done => {
    const req: RequestPost = {
      url: "https://httpbin.org/post",
    };

    post.run(req).fork(
      err => {
        expect(err).toBeNull();
        done();
      },
      res => {
        console.log("---", res);
        expect(res).toBeTruthy();
        done();
      }
    );
  });


});
