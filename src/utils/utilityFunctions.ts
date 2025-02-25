import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { Wllama } from '@wllama/wllama';

// @ts-expect-error
window.CreateMLCEngine = CreateMLCEngine;
// @ts-expect-error
window.MLCEngine = MLCEngine;

const CONFIG_PATHS = {
  'single-thread/wllama.wasm': '../node_modules/@wllama/wllama/esm/single-thread/wllama.wasm',
  'multi-thread/wllama.wasm' : '../node_modules/@wllama/wllama/esm/multi-thread/wllama.wasm',
};

//@ts-expect-error
window.wllama = new Wllama(CONFIG_PATHS);

export const delay = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

// @ts-expect-error
window.delay = delay;
