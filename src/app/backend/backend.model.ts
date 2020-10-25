type Config = {
  login_path: string,
  signup_path: string,
};

export class Backend {

  static available: Backend[] = [
    // { name: 'Golang/Gin (TODO)'},
    // { name: 'Golang/Std lib (TODO)'},
    // { name: 'Node/Express (TODO)'},

    new Backend('PostgREST', {
      login_path: '/rpc/login',
      signup_path: '/rpc/signup',
    }),

    new Backend('Java/Spring boot (TODO)', {
      login_path: '/TODO',
      signup_path: '/TODO',
    }),
  ];

  constructor(public name: string, public config: Config) {
  }

}
