export class Reminder {
  done = false;

  constructor(public content: string, public due: Date) {
  }
}
