import {Backend} from './backend.model';

const InvalidInputError = new Error('Invalid input!');

export class GolangGinBackend extends Backend {
  csrfURL(): string {
    return this.host + '/csrf';
  }

  signupURL(): string {
    return this.host + '/register';
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
      url += '&is_due=1'
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

    return this.host + `/reminders?ids=${ids.join(',')}`;
  }

}
