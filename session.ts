import { DefinitionTable } from './intermediate-ast-node';
import { toAst } from './visitor';
import * as readline from 'readline';


function promisify<T>(value: T) {
  return new Promise<T>((resolve) => resolve(value));
}

enum SessionState {
  ACTIVE,
  STOPPED
}

export class ReplSession {
  private defTable = new DefinitionTable()
  private state = SessionState.ACTIVE

  constructor(private interf: SessionInterface, private printAst: boolean = false) {}

  run() {
    this._run().then()
  }

  private async _run() {
    this.interf.handshake?.(this);

    while(this.state === SessionState.ACTIVE) {
      await this.requestNextMessage();
    }

    process.exit(0);
  }

  async requestNextMessage() {
    const msg = await this.interf.requestMessage()

    if (msg instanceof EvalMessage) {
      let ast = toAst(msg.str, this.defTable);
      if (this.printAst) {console.log(ast.toString())};
      msg.callback(ast.eval({defTable: this.defTable}).toString());
    } else
    if (msg instanceof ExitMessage) {
      this.state = SessionState.STOPPED;
    } else
    if (msg instanceof SwitchMessage) {
      this.interf = msg.newInterface;
    } else
    throw new Error()

  }
}

export interface SessionInterface {
  handshake?(session: ReplSession): void
  requestMessage(): Promise<Message>
}

export type Message = EvalMessage|ExitMessage|SwitchMessage;

export class EvalMessage {
  constructor(public str: string, public callback: (res: string) => void) {}
}

export class ExitMessage {
  constructor() {}
}

export class SwitchMessage {
  constructor(public newInterface: SessionInterface) {}
}

export class AutoInterface implements SessionInterface {
  constructor(private it: Generator<string>, private switchInterface?: SessionInterface) {}

  requestMessage(): Promise<Message> {
    let res = this.it.next();
    let msg: Message;
    if(res.done) {
      msg = this.switchInterface ? new SwitchMessage(this.switchInterface) : new ExitMessage;
    } else {
      console.log(`>>> ${res.value}`)
      msg = new EvalMessage(res.value, console.log);
    }
    return promisify(msg);
  }
}

export class CliInterface implements SessionInterface {
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  requestMessage(): Promise<Message> {
    return new Promise(resolve => {
      this.rl.question('>>> ', ans => resolve(new EvalMessage(ans, console.log)))
    })
  }
}