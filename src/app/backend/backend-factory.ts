import {PostgrestBackend} from './postgrest-backend';
import {NodeExpressBackend} from './node-express-backend';
import {Backend} from './backend.model';
import {GolangGinBackend} from './golang-gin-backend';
import {RubyLocalBackend} from './ruby-local-backend';

export type BackendNames = 'PostgREST'
  | 'Ruby/Local'
  | 'Golang/Gin'
  | 'Node/Express' ;

function enforceSwitchComplete(x: never) {
  throw new Error(x);
}

export class BackendFactory {

  static availables: BackendNames[] = [
    'PostgREST',
    'Node/Express',
    'Golang/Gin',
    'Ruby/Local',
  ];

  static create(name: BackendNames, host: string): Backend {
    switch (name) {
      case 'PostgREST':
        return new PostgrestBackend(host);
      case 'Node/Express':
        return new NodeExpressBackend(host);
      case 'Golang/Gin':
        return new GolangGinBackend(host)
      case 'Ruby/Local':
        return new RubyLocalBackend("bogus")
    }

    enforceSwitchComplete(name);
  }
}
