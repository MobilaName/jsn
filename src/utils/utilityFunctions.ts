// import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { Wllama } from '@wllama/wllama';

// // @ts-expect-error
// window.CreateMLCEngine = CreateMLCEngine;
// // @ts-expect-error
// window.MLCEngine = MLCEngine;

const CONFIG_PATHS = {
  'single-thread/wllama.wasm': '../node_modules/@wllama/wllama/esm/single-thread/wllama.wasm',
  'multi-thread/wllama.wasm' : '../node_modules/@wllama/wllama/esm/multi-thread/wllama.wasm',
};


export const delay = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

const progressCallback =  ({ loaded, total } : { loaded: number; total: number }) => {
  const progressPercentage = Math.round((loaded / total) * 100);
  console.clear();
  console.log(`Downloading... ${progressPercentage}%`);
};

function convertHuggingFaceURLToSettings(url: string) {
  // Extract the repository and file name from the URL
  const match = url.match(/huggingface\.co\/(.+?)\/blob\/main\/(.+?\.gguf)/);
  
  if (!match) {
    throw new Error("Invalid Hugging Face URL format");
  }
  
  const repo = match[1];
  const file = match[2];
  
  return [
    repo,
    file
  ];
}

export const wllama = async (modelUrl?: string) => {
  const wll = new Wllama(CONFIG_PATHS);
  let model = [
    'Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF',
    'qwen2.5-coder-0.5b-instruct-q2_k.gguf'
  ];

  if (modelUrl) {
    model = convertHuggingFaceURLToSettings(modelUrl);
  }
  await wll.loadModelFromHF(
    model[0], model[1],
    {
      progressCallback,
    }
  );

  return wll;
}

export const agentChat = async (wll: Wllama, chat: any[]) => {
  return wll.createCompletion(
    chat.map(c=>`<|${c.role}|>${c.content}<|endoftext|>`).join('\n')
    + '<|assistant|>', {
      useCache: true,
      // @ts-expect-error
      nThreads: -1, // auto
      nContext: 8192,
      nPredict: 500,
      nBatch: 128,
      sampling: {
        temp: 0.5,
        top_k: 10,
        top_p: 0.5,
        penalty_repeat: 1,
      },
    });
};
