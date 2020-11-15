import {Backend} from './backend.model';

const InvalidInputError = new Error('Invalid input!');

export class PostgrestBackend extends Backend {
  static InvalidInputError = InvalidInputError;

  loginURL() {
    return this.host + '/rpc/login';
  }

  signupURL() {
    return this.host + '/rpc/signup';
  }

  reminderURL(id: number) {
    if (!id) {
      throw InvalidInputError;
    }
    return this.host + `/reminders?id=eq.${id}`;
  }

  remindersURL(ids?: number[]) {
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

  remindersSortURL(paginate?: { limit: number; offset: number },
                   search?: { contentLike: string }): string {
    let url = this.remindersURL() + '?order=due.asc,id.desc';
    if (paginate) {
      url += `&limit=${paginate.limit}&offset=${paginate.offset}`;
    }

    if (search) {
      url += `&content=ilike.${search.contentLike}`;
    }

    return url;
  }

}
