export enum HttpStatusCode {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  NotAcceptable = 406,
  InternalServerError = 500,
}

export enum WebsocketStatusCode {
  BadRequest = 4400,
  Unauthorized = 4401,
  NotFound = 4404,
  NotAcceptable = 4406,
  InternalServerError = 4500,
}
