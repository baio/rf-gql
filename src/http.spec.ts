import { request, Request, requestPromise } from "./http";

describe("http", () => {

  it("request google", (done) => {

    const req: Request = {
      method: "GET",
      url: "http://google.com"
    };

    console.log(requestPromise);
    //request.run(req);

    done();

    /*
    .fork(
      err => {
        expect(err).toBeNull();
        done();
      },
      res => {
        expect(res).toBeTruthy();
      }
    );
    */


  });


});
