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
    return this.host + '/reminders';
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
      return this.host + `/reminders?id=eq.${ids[0]}`;
    }

    const strIds = ids
      .map(n => `id.eq.${n}`)
      .join(',');

    // one of a list of values, e.g. ?a=in.(1,2,3)
    // – also supports commas in quoted strings like ?a=in.("hi,there","yes,you")
    return this.host + `/reminders?or=(${strIds})`;
  }

}
