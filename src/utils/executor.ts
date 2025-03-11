import { consoleEvents, CodeChunk, ConsoleEvent, ExecutionContext, LogArgsType, ConsoleLogType, VarsAndSecretsType } from "../types.d";
import { agentChat, delay, pgLite, wllama } from "./utilityFunctions";
import { types } from '@electric-sql/pglite'

export interface ExecutorConstructor {
  new(): Executor;
}

export interface Executor {
  context: ExecutionContext;
  consoleLogs: ConsoleLogType[];
  originalConsoleLog: ConsoleMethod;
  currentChunkIdx: number;
  executeChunk: (chunk: CodeChunk, cidx: number, updateLogs: UpdateLogsFunction) => Promise<ConsoleLogType[]>;
  getConsoleLogs: () => ConsoleLogType[];
  resetConsoleLogs: () => void;
  resetConsole: () => void;
  clearContext: () => void;
}

export type UpdateLogsFunction = (logs: ConsoleLogType[]) => void;

export type ConsoleMethod = (...args: any[]) => void;

export class ChunkedExecutor implements Executor {
  context: ExecutionContext;
  consoleLogs: ConsoleLogType[];
  originalConsoleLog: ConsoleMethod;
  currentChunkIdx: number;

  constructor() {
    this.context = {
      ai: wllama,
      delay,
      aiChat: agentChat,
      pgLite,
      types,
    };

    ['document', 'location'].forEach((key:string) => this.context[key] = `undefined`);
    this.consoleLogs = [];
    this.originalConsoleLog = console.log;
    this.currentChunkIdx = NaN;
  }

  async executeChunk(chunk: CodeChunk, cidx: number, updateLogs: UpdateLogsFunction = () => {}): Promise<ConsoleLogType[]> {
    try {
      this.consoleLogs = this.consoleLogs.filter(l => l.chunkIdx !== cidx);
      const storedVars:VarsAndSecretsType[] = JSON.parse(localStorage.getItem('varsAndSecrets') || '[]');
      const formattedVars = storedVars.map((varAndSecret:VarsAndSecretsType) => (
        { ...varAndSecret, value: varAndSecret.type === 'secret' ? atob(varAndSecret.value) : varAndSecret.value }
      ));
      this.context['vars'] = {};
      this.context['secrets'] = {};
      // @ts-expect-error
      this.context.axios = window.electronAPI?.fetchRequest;

      formattedVars.forEach((varAndSecret:VarsAndSecretsType) => {
        this.context[varAndSecret.type + 's'][varAndSecret.name] = varAndSecret.value;
      });

      consoleToArray(this, cidx, updateLogs);
      this.currentChunkIdx = cidx;
    
      const asyncFunc = new Function('context', `
        return (async () => {
          with (context) {
            ${chunk.content}
          }
        })();
      `);
      
      await asyncFunc(this.context);
      
      // Update context reference for variables declared with var
      Object.assign(this.context, this.context);
    } catch (err) {
      console.error("Error in chunk execution:", err);
    }

    return this.getConsoleLogs();
  }

  getConsoleLogs(): ConsoleLogType[] { return this.consoleLogs; }
  resetConsoleLogs(): void { this.consoleLogs = []; }
  resetConsole(): void { consoleFromArray(this); }
  clearContext(): void { this.context = {}; }
}

export const consoleToArray = (self: ChunkedExecutor, cidx: number, updateLogs: UpdateLogsFunction): void => {
  consoleEvents.forEach((event: ConsoleEvent) => {
    // @ts-expect-error
    self[`consoleEvents${event}`] = console[event];
    // @ts-expect-error
    self[`consoleEventsclear`] = console.clear;
    // @ts-expect-error
    console[event] = ((chunkIdx) => (...args: LogArgsType) => {
      let time = Date.now();
      const logWithTheSameTime = self.consoleLogs.find(l => l.time === time);
      if (logWithTheSameTime) {
        time += Math.random() * 1000;
      }
      self.consoleLogs.push({ type: event, chunkIdx, args, time });
      updateLogs(self.consoleLogs);
    })(cidx);

    console.clear = ((chunkIdx) => () => {
      self.consoleLogs = self.consoleLogs.filter(l => l.chunkIdx !== chunkIdx);
      updateLogs(self.consoleLogs);
    })(cidx);
  })
}

export const consoleFromArray = (self: ChunkedExecutor): void => {
  consoleEvents.forEach((event: ConsoleEvent) => {
    // @ts-expect-error
    console[event] = self[`consoleEvents${event}`];
    // @ts-expect-error
    console.clear = self[`consoleEventsclear`];
  })
}

export const mergeCode = function(codeArray: SplittedCode[]) {
  return codeArray.map((item, idx) => 
    item.type === 'comment' 
      ? `\n/* ${item.content} */\n` 
      : `\n// ~~codeblock ${idx}\n\n${item.content}`
  ).join('\n');
}
