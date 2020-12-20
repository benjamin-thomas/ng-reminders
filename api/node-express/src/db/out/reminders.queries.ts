/** Types generated for queries found in "src/db/in/reminders.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'FindAllReminders' parameters type */
export type IFindAllRemindersParams = void;

/** 'FindAllReminders' return type */
export interface IFindAllRemindersResult {
  id: string;
  user_id: string;
  content: string;
  done: boolean;
  due: Date | null;
}

/** 'FindAllReminders' query type */
export interface IFindAllRemindersQuery {
  params: IFindAllRemindersParams;
  result: IFindAllRemindersResult;
}

const findAllRemindersIR: any = {"name":"FindAllReminders","params":[],"usedParamSet":{},"statement":{"body":"SELECT * FROM reminders","loc":{"a":29,"b":51,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM reminders
 * ```
 */
export const findAllReminders = new PreparedQuery<IFindAllRemindersParams,IFindAllRemindersResult>(findAllRemindersIR);


/** 'FindReminderById' parameters type */
export interface IFindReminderByIdParams {
  reminderID: string | null | void;
}

/** 'FindReminderById' return type */
export interface IFindReminderByIdResult {
  id: string;
  user_id: string;
  content: string;
  done: boolean;
  due: Date | null;
}

/** 'FindReminderById' query type */
export interface IFindReminderByIdQuery {
  params: IFindReminderByIdParams;
  result: IFindReminderByIdResult;
}

const findReminderByIdIR: any = {"name":"FindReminderById","params":[{"name":"reminderID","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":120,"b":129,"line":5,"col":36}]}}],"usedParamSet":{"reminderID":true},"statement":{"body":"SELECT * FROM reminders WHERE id = :reminderID","loc":{"a":84,"b":129,"line":5,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM reminders WHERE id = :reminderID
 * ```
 */
export const findReminderById = new PreparedQuery<IFindReminderByIdParams,IFindReminderByIdResult>(findReminderByIdIR);


