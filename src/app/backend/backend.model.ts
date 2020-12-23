interface BackendURLs {
  loginURL: () => string;
  signupURL: () => string;
  reminderURL: (id: number) => string;
  remindersURL: (ids?: number[]) => string;

  remindersSortURL: (page: number,
                     perPage: number,
                     contentLike: string,
                     isDue: boolean) => string;
}

export abstract class Backend implements BackendURLs{
  protected host: string;

  constructor(host: string) {
    this.host = host;
  }

  abstract loginURL(): string;

  abstract signupURL(): string;

  abstract reminderURL(id: number): string;

  abstract remindersURL(ids?: number[]): string;

  abstract remindersSortURL(page: number,
                            perPage: number,
                            contentLike: string,
                            isDue: boolean): string;
}
