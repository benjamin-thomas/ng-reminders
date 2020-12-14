import {PostgrestBackend} from './postgrest-backend';
import {NodeExpressBackend} from './node-express-backend';
import {Backend} from './backend.model';

export type BackendNames = 'PostgREST'
  | 'Node/Express' ;

function enforceSwitchComplete(x: never) {
  throw new Error(x);
}

export class BackendFactory {

  static availables: BackendNames[] = [
    'PostgREST',
    'Node/Express',
  ];

  static create(name: BackendNames, host: string): Backend {
    switch (name) {
      case 'PostgREST':
        return new PostgrestBackend(host);
      case 'Node/Express':
        return new NodeExpressBackend(host);
    }

    enforceSwitchComplete(name);
  }
}
