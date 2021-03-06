/** Types generated for queries found in "src/db/in/users.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'FindAllUsers' parameters type */
export type IFindAllUsersParams = void;

/** 'FindAllUsers' return type */
export interface IFindAllUsersResult {
  id: string;
  email: string;
  pw_hash: string;
}

/** 'FindAllUsers' query type */
export interface IFindAllUsersQuery {
  params: IFindAllUsersParams;
  result: IFindAllUsersResult;
}

const findAllUsersIR: any = {"name":"FindAllUsers","params":[],"usedParamSet":{},"statement":{"body":"SELECT * FROM users","loc":{"a":25,"b":43,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM users
 * ```
 */
export const findAllUsers = new PreparedQuery<IFindAllUsersParams,IFindAllUsersResult>(findAllUsersIR);


/** 'FindUserById' parameters type */
export interface IFindUserByIdParams {
  userId: string | null | void;
}

/** 'FindUserById' return type */
export interface IFindUserByIdResult {
  id: string;
  email: string;
  pw_hash: string;
}

/** 'FindUserById' query type */
export interface IFindUserByIdQuery {
  params: IFindUserByIdParams;
  result: IFindUserByIdResult;
}

const findUserByIdIR: any = {"name":"FindUserById","params":[{"name":"userId","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":104,"b":109,"line":5,"col":32}]}}],"usedParamSet":{"userId":true},"statement":{"body":"SELECT * FROM users WHERE id = :userId","loc":{"a":72,"b":109,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM users WHERE id = :userId
 * ```
 */
export const findUserById = new PreparedQuery<IFindUserByIdParams,IFindUserByIdResult>(findUserByIdIR);


/** 'FindUserByEmail' parameters type */
export interface IFindUserByEmailParams {
  email: string | null | void;
}

/** 'FindUserByEmail' return type */
export interface IFindUserByEmailResult {
  id: string;
  email: string;
  pw_hash: string;
}

/** 'FindUserByEmail' query type */
export interface IFindUserByEmailQuery {
  params: IFindUserByEmailParams;
  result: IFindUserByEmailResult;
}

const findUserByEmailIR: any = {"name":"FindUserByEmail","params":[{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":176,"b":180,"line":8,"col":35}]}}],"usedParamSet":{"email":true},"statement":{"body":"SELECT * FROM users WHERE email = :email","loc":{"a":141,"b":180,"line":8,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM users WHERE email = :email
 * ```
 */
export const findUserByEmail = new PreparedQuery<IFindUserByEmailParams,IFindUserByEmailResult>(findUserByEmailIR);


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

const insertUserIR: any = {"name":"InsertUser","params":[{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":251,"b":255,"line":11,"col":44}]}},{"name":"pwHash","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":259,"b":264,"line":11,"col":52}]}}],"usedParamSet":{"email":true,"pwHash":true},"statement":{"body":"INSERT INTO users (email, pw_hash) VALUES (:email, :pwHash) RETURNING id","loc":{"a":207,"b":278,"line":11,"col":0}}};

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

const updateUserIR: any = {"name":"UpdateUser","params":[{"name":"email","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":343,"b":347,"line":15,"col":25}]}},{"name":"pwHash","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":384,"b":389,"line":16,"col":27}]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":414,"b":415,"line":17,"col":13}]}}],"usedParamSet":{"email":true,"pwHash":true,"id":true},"statement":{"body":"UPDATE users\n   SET email = COALESCE(:email, email)\n     , pw_hash = COALESCE(:pwHash, pw_hash)\n WHERE id = :id","loc":{"a":305,"b":415,"line":14,"col":0}}};

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

const deleteUserIR: any = {"name":"DeleteUser","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":472,"b":473,"line":20,"col":30}]}}],"usedParamSet":{"id":true},"statement":{"body":"DELETE FROM users WHERE id = :id","loc":{"a":442,"b":473,"line":20,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM users WHERE id = :id
 * ```
 */
export const deleteUser = new PreparedQuery<IDeleteUserParams,IDeleteUserResult>(deleteUserIR);


