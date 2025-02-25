/// <reference types="vite/client" />

interface SplittedCode extends Object {
  type: 'code' | 'comment';
  content: string;
  uuid: string;
}
