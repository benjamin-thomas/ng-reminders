export class Reminder {
  id: number;
  done = false;

  constructor(public content: string, public due: Date) {
  }
}
