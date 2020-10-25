export type BackendPaths = {
  login: string,
  signup: string,
};

type ApiBugs = {
  signupExtraParens: boolean,
};

export class Backend {

  static available: Backend[] = [
    // { name: 'Golang/Gin (TODO)'},
    // { name: 'Golang/Std lib (TODO)'},
    // { name: 'Node/Express (TODO)'},

    new Backend('PostgREST', {
      login: '/rpc/login',
      signup: '/rpc/signup',
    }, {
      signupExtraParens: true,
    }),

    new Backend('Java/Spring boot (TODO)', {
      login: '/TODO',
      signup: '/TODO',
    }),
  ];

  constructor(public name: string,
              public paths: BackendPaths,
              public bugs: ApiBugs = {
                signupExtraParens: false,
              }) {
  }

}
