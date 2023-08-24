export type Status = 200 | 401 | 403 | 500;
/**
 * TODO: http-errors로 대체할 것
 */
// 불변 객체
export class StatusError extends Error {
  #status: Status;

  constructor(status: Status, message: string) {
    super(message);
    this.#status = status;
  }

  get status() {
    return this.#status;
  }
}
