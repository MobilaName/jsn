
/*              # Wllama

**Позволяет запускать ИИ-модели локально прямо в браузере. Работает +- везде**

Ссылка: <u>https://github.com/ngxson/wllama</u>              */


/* ## Вызываем модель

Можно передать ссылку на **.gguf**-файл с *Hugginface*      */


// ~~codeblock 2

agent = await ai('https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/blob/main/qwen2.5-0.5b-instruct-q8_0.gguf');

//  https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/blob/main/qwen2.5-0.5b-instruct-q8_0.gguf
//  'Qwen/Qwen2.5-0.5B-Instruct-GGUF',
//  'qwen2.5-0.5b-instruct-q8_0.gguf',

//  'unsloth/DeepSeek-R1-Distill-Qwen-1.5B-GGUF',
//  'DeepSeek-R1-Distill-Qwen-1.5B-Q2_K.gguf',

/*         ## Запрос         */


// ~~codeblock 4

chat = [{
    role: 'system',
    content: `Role: Expert JavaScript Developer. You create JavaScript code based on the given requirements. Before returning the final code, you mentally simulate the entire code creation process, considering problem understanding, edge cases, performance, and code structure. Reread and rethink the entire solution before finalizing. Return only the final, clean JavaScript code without comments or drafts. Skip all the comments. Prioritize clarity, performance, and maintainability.`
},
{
    role: 'user',
    content: 'Functionality description: merge two arrays, add row with `0` after each item in in the resulated array and sort the final array'
}];

/*         ## Выполнение         */


// ~~codeblock 6

const response = await aiChat(agent, chat);
console.log(response);