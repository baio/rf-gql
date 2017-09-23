# Functional library to help build graphql servers.

## Summary

```
resolver<R>:: HttpConfig -> Reader<GQLRequest, Request> -> Reader<GQLRequestContext, Future<any, R>> -> (root, args, context, meta) -> Promise<R>
```

Use `Reader<GQLRequest, Request>` to convert `GQLRequest` to `Request`.

Use `Reader<GQLRequestContext, Future<any, R>>` to chain requests.

## Http

```
requestF a::Reader<GQLRequestContext, Future<any, a>>
```
Future will be created with `http.request`
Future will dispatch actual http request.
Future created with `http.request` is always cached.

## Use with other Futures (tests)
To use another future  `mapReaderF a:: Reader Future<any, a> -> Reader Future<GQLRequestContext, a>`

## Development

+ install npm : `npm install`
+ watch / build : `npm start`
+ build : `npm run build`
+ test (+ build) : `npm test`
+ npm link (+ build): `npm run link`

### Use link in dependent projects

+ npm link
+ cd proj
+ npm link rf-gql
+ setup nodemon to watch link npm
  + update `nodemon.json` to stop ignore node_modules from watch `"ignoreRoot": [".git"],`
  + add watch /rebuild command to package.json `concurrently \"cross-env NODE_ENV=dev nodemon --watch ./node_modules/rf-gql/dist --watch dist dist/index.js\" \"cross-env NODE_ENV=dev tsc -w\"`
+

## TODO

+ Reader / Future types.

## License

???