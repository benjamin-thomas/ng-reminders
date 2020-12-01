/** Types generated for queries found in "src/queries/users.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'FindUserById' parameters type */
export interface IFindUserByIdParams {
  userId: string | null | void;
}

/** 'FindUserById' return type */
export interface IFindUserByIdResult {
  id: string;
  email: string;
  pwHash: string;
}

/** 'FindUserById' query type */
export interface IFindUserByIdQuery {
  params: IFindUserByIdParams;
  result: IFindUserByIdResult;
}

const findUserByIdIR: any = {"name":"FindUserById","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":57,"b":62,"line":2,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT * FROM users WHERE id = :userId","loc":{"a":25,"b":62,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM users WHERE id = :userId
 * ```
 */
export const findUserById = new PreparedQuery<IFindUserByIdParams,IFindUserByIdResult>(findUserByIdIR);


/** 'FindAllUsers' parameters type */
export type IFindAllUsersParams = void;

/** 'FindAllUsers' return type */
export interface IFindAllUsersResult {
  id: string;
  email: string;
  pwHash: string;
}

/** 'FindAllUsers' query type */
export interface IFindAllUsersQuery {
  params: IFindAllUsersParams;
  result: IFindAllUsersResult;
}

const findAllUsersIR: any = {"name":"FindAllUsers","params":[],"usedParamSet":{},"statement":{"body":"SELECT * FROM users","loc":{"a":91,"b":109,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM users
 * ```
 */
export const findAllUsers = new PreparedQuery<IFindAllUsersParams,IFindAllUsersResult>(findAllUsersIR);


/** 'InsertUser' parameters type */
export interface IInsertUserParams {
  email: string | null | void;
  pwHash: string | null | void;
}

/** 'InsertUser' return type */
export interface IInsertUserResult {
  id: string;
}

/** 'InsertUser' query type */
export interface IInsertUserQuery {
  params: IInsertUserParams;
  result: IInsertUserResult;
}

const insertUserIR: any = {"name":"InsertUser","params":[{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":180,"b":184,"line":8,"col":44}]}},{"name":"pwHash","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":188,"b":193,"line":8,"col":52}]}}],"usedParamSet":{"email":true,"pwHash":true},"statement":{"body":"INSERT INTO users (email, pw_hash) VALUES (:email, :pwHash) RETURNING id","loc":{"a":136,"b":207,"line":8,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (email, pw_hash) VALUES (:email, :pwHash) RETURNING id
 * ```
 */
export const insertUser = new PreparedQuery<IInsertUserParams,IInsertUserResult>(insertUserIR);


/** 'UpdateUser' parameters type */
export interface IUpdateUserParams {
  email: string | null | void;
  pwHash: string | null | void;
  id: string | null | void;
}

/** 'UpdateUser' return type */
export type IUpdateUserResult = void;

/** 'UpdateUser' query type */
export interface IUpdateUserQuery {
  params: IUpdateUserParams;
  result: IUpdateUserResult;
}

const updateUserIR: any = {"name":"UpdateUser","params":[{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":272,"b":276,"line":12,"col":25}]}},{"name":"pwHash","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":313,"b":318,"line":13,"col":27}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":343,"b":344,"line":14,"col":13}]}}],"usedParamSet":{"email":true,"pwHash":true,"id":true},"statement":{"body":"UPDATE users\n   SET email = COALESCE(:email, email)\n     , pw_hash = COALESCE(:pwHash, pw_hash)\n WHERE id = :id","loc":{"a":234,"b":344,"line":11,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * UPDATE users
 *    SET email = COALESCE(:email, email)
 *      , pw_hash = COALESCE(:pwHash, pw_hash)
 *  WHERE id = :id
 * ```
 */
export const updateUser = new PreparedQuery<IUpdateUserParams,IUpdateUserResult>(updateUserIR);


/** 'DeleteUser' parameters type */
export interface IDeleteUserParams {
  id: string | null | void;
}

/** 'DeleteUser' return type */
export type IDeleteUserResult = void;

/** 'DeleteUser' query type */
export interface IDeleteUserQuery {
  params: IDeleteUserParams;
  result: IDeleteUserResult;
}

const deleteUserIR: any = {"name":"DeleteUser","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":401,"b":402,"line":17,"col":30}]}}],"usedParamSet":{"id":true},"statement":{"body":"DELETE FROM users WHERE id = :id","loc":{"a":371,"b":402,"line":17,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM users WHERE id = :id
 * ```
 */
export const deleteUser = new PreparedQuery<IDeleteUserParams,IDeleteUserResult>(deleteUserIR);


