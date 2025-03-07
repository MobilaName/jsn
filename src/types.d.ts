export enum ConsoleEvent {
  Log = 'log',
  Dir = 'dir',
  Warn = 'warn',
  Error = 'error',
  Table = 'table',
  Chart = 'chart',
  Info = 'info',
  Clear = 'clear'
}
export const consoleEvents = Object.values(ConsoleEvent) as const;

export interface Executed {
  [key: number]: number
}

export type ChartType = 'bar' | 'pie' | 'line';

export interface SplittedCode {
  type: 'code' | 'comment';
  content: string;
  uuid: string;
}

export interface ExecutionContext {
  [key: string]: any;
}

export type LogArgsType = (string | number | ChartData |  ChartOptions | ChartType)[]

export interface ConsoleLogType {
  type: ConsoleEvent;
  args: LogArgsType;
  chunkIdx: number;
  time: number,
}

export interface ExecutionContext {
  [key: string]: any;
}

export interface CodeChunk {
  content: string;
  uuid: string;
}

export interface FileType {
  name: string;
  type: 'folder' | 'file';
  children?: FileType[];
}

export interface VarsAndSecretsType {
  name: string;
  value: string;
  type: 'var' | 'secret';
}
