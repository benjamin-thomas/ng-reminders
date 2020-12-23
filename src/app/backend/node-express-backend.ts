import {Backend} from './backend.model';

const InvalidInputError = new Error('Invalid input!');

export class NodeExpressBackend extends Backend {
  signupURL(): string {
    return this.host + '/users';
  }

  loginURL(): string {
    return this.host + '/login';
  }

  reminderURL(id: number): string {
    return `${this.host}/reminders/${id}`;
  }

  remindersSortURL(page: number, perPage: number, contentLike: string, isDue: boolean): string {
    let url = this.remindersURL();

    url += `?page=${page}&per_page=${perPage}`;

    if (isDue) {
      url += '&is_due'
    }

    if (contentLike) {
      url += `&q=${contentLike}`;
    }

    return url;
  }

  remindersURL(ids?: number[]): string {
    if (ids === undefined) {
      return this.host + '/reminders';
    }

    if (ids.length === 0) {
      throw InvalidInputError;
    }

    if (ids.length === 1) {
      throw InvalidInputError;
    }

    return this.host + `/reminders?ids=${ids.join(',')}`;
  }

}
