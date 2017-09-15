# Functional library to help build graphql servers.

## Summary

```
resolver<R>:: HttpConfig -> Reader<GQLRequest, Request> -> Reader<GQLRequestContext, Future<any, R>> -> (root, args, context, meta) -> Promise<R>
```

Use `Reader<GQLRequest, Request>` to convert `GQLRequest` to `Request`.

Use `Reader<GQLRequestContext, Future<any, R>>` to chain requests.


## Development

+ install npm : `npm install`
+ build : `npm run build`
+ test (+ build) : `npm test`
+ npm link (+ build): `npm run link`
+ npm publish (+ build + test): `npm run publish`

## TODO

+ Reader / Future types.

## License

???