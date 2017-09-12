import { reshape } from "./future-utils";
import { gql2request, GQLRequestContext, HttpConfig } from "./graphql";
import { request } from "./http";
import { log } from "./utils";

describe("graphql", () => {

  it("run request from graphql context", (done) => {

    const httpConfig: HttpConfig = {
      baseUrl: "https://httpbin.org",
      providers: {
        "ip": "ip",
        "uuid": "uuid"
      },
      api: {}
    };

    const requestContext: GQLRequestContext = {
        config: httpConfig,
        request: {
          provider: "ip",
          url: "",
          method: "GET"
        },
        gqlRequest : {
          root: {},
          args: {},
          context: {},
          meta: {}
        }
    };

    gql2request
    .map(request.run)
    .run(requestContext)
    .fork(
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
