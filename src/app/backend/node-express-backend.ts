import {Backend} from './backend.model';

export class NodeExpressBackend extends Backend {
  signupURL(): string {
    return this.host + '/users';
  }

  loginURL(): string {
    return '#TODO';
  }

  reminderURL(id: number): string {
    return '#TODO';
  }

  remindersSortURL(limit: number, offset: number, contentLike: string, isDue: boolean): string {
    return '#TODO';
  }

  remindersURL(ids?: number[]): string {
    return '#TODO';
  }

}
