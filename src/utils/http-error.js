export default class HTTPError extends Error {
  constructor(statusCode, data) {
    super(`HTTPError: ${statusCode} received`);
    this.status = statusCode;
    this.data = data;
  }
}
