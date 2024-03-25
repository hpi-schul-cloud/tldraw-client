export class HttpGuard {
    static checkStatusOk(response: Response) {
      if (!response.ok) {
        throw new Error(`${response.status} - ${response.statusText}`);
      }
    }
}
