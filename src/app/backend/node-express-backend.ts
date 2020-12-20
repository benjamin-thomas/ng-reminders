import {Backend} from './backend.model';
import * as moment from 'moment';

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

  remindersSortURL(limit: number, offset: number, contentLike: string, isDue: boolean): string {
    // Handle bad params, this will do for now
    if (limit === null) {
      limit = 1;
    }
    if (offset === null) {
      offset = 0;
    }

    let url = this.remindersURL()
      + '?order=due.asc,id.desc'
      + `&limit=${limit}&offset=${offset}`
    ;

    if (contentLike) {
      url += `&content=ilike.${contentLike}`;
    }

    const now = moment().format('YYYY-MM-DDTHH:mm:ss');
    if (isDue === true) {
      url += `&due=lt.${now}`; // lt.now works but dependent on server time so not really a great option
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
