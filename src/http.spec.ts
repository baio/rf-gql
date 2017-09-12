import { request, Request } from "./http";

describe("http", () => {

  it("request google", (done) => {

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


});
