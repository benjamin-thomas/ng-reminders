import {PostgrestBackend} from './postgrest-backend';
import {Backend} from './backend.model';

export type BackendNames = 'PostgREST'
  | 'Bogus' ;

function enforceSwitchComplete(x: never) {
  throw new Error(x);
}

export class BackendFactory {

  static availables: BackendNames[] = [
    'PostgREST',
  ];

  static create(name: BackendNames, host: string): Backend {
    switch (name) {
      case 'PostgREST':
        return new PostgrestBackend(host);
      case 'Bogus':
        return new PostgrestBackend(host);
    }

    enforceSwitchComplete(name);
  }
}
