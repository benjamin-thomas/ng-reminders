import {Backend} from './backend.model';

export class RubyLocalBackend extends Backend {
  constructor(host: string) {
    super(host) // bogus, must keep
    this.host = 'http://localhost:4567'
  }

  csrfURL(): string {
    return this.host + '/api/bogus-csrf';
  }

  loginURL(): string {
    return this.host + '/api/bogus-login';
  }

  reminderURL(id: number): string {
    return this.host + `/api/reminders/${id}`;
  }

  remindersSortURL(page: number, perPage: number, contentLike: string, isDue: boolean): string {
    return this.host + '/api/reminders';
  }

  remindersURL(ids?: number[]): string {
    return this.host + '/#TODO3';
  }

  signupURL(): string {
    return this.host + '/#NOOP3';
  }
}
