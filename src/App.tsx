import { KeyboardEvent, useEffect, useState } from 'react';
import Select from 'react-select';
import { AiOutlineFileAdd } from 'react-icons/ai';
import { JavaScriptCode } from './utils/code';
import { ChunkedExecutor } from './utils/executor';
import './utils/utilityFunctions';

import '@mdxeditor/editor/style.css'
import 'prismjs/themes/prism.css';
import 'chartist/dist/index.css';
import { ConsoleLogType, FileType, Executed } from './types.d';
import Header from './layout/Header';
import NoteEditor from './layout/Editor';

let executor = new ChunkedExecutor();

const jsCode = `
/* # Google Chrome и Gemini Nano

### Требования:
- Скачать **Google Chrome Canary** https://www.google.com/chrome/canary/
- Включить эксперементальные флаги:
  - \`chrome://flags/#optimization-guide-on-device-model\`
  - \`chrome://flags/#prompt-api-for-gemini-nano\`

Перезапускаем браузер и все!  */
/*\`ai.languageModel.create\` - позволяет создать новую "сессию" с ии-ассистентом.

Можно также сразу задать системный запрос, которые будет использоваться во время выполнения \`systemPrompt\`.
*/
assistent;

/* Пользовательский запрос выполняется с помощью функции \`prompt\` */
let response;

console.log(response);

`;

const CodeArray = new JavaScriptCode(jsCode).getArray();

function App() {
  const [files, setFiles] = useState([]);
  const [dir, setDir] = useState([]);
  const [code, setCode] = useState(CodeArray);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [logs, setLogs] = useState<ConsoleLogType[]>([]);
  const [executing, setExecuting] = useState<boolean>(false);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [activeBlock, setActiveBlock] = useState(NaN);
  const [executed, setExecuted] = useState<Executed>({});

  useEffect(() => {
    if (!Number.isNaN(activeBlock))
      document.body.addEventListener('keypress', setRunBlockEvent as any);

    return () => {
      document.body.removeEventListener('keypress', setRunBlockEvent as any);
    }
  }, [activeBlock]);

  const updateExecuted = (setValues:Executed) => {
    setExecuted({...executed, ...setValues});
  };

  const handleSelectFolder = async () => {
    // @ts-expect-error
    if (window.electronAPI) {
      // @ts-expect-error
      const [dir, fileList] = await window.electronAPI.selectFolder();
      console.log({fileList, dir})
      setFiles(fileList);
      setDir(dir);
    } else {
      console.error("Electron API not available");
    }
  };

  const setRunBlockEvent = (event: KeyboardEvent<HTMLBodyElement>) => {
    if (event.ctrlKey && event.key === 'Enter') {
      document.getElementById(`run-btn-${activeBlock}`)?.click();
    }
  }

  const runAllBlocks = async () => {
    const _executed:Executed = {};
    setExecuting(true);
    setCurrentChunk(0);
    let codeIdx = 0;
    for (let [_idx, chunk] of code.entries()) {
      if (chunk.type === 'code') {
        codeIdx++;
        _executed[codeIdx] = 1;
        updateExecuted(_executed);
        await executor.executeChunk(chunk, codeIdx - 1, setLogs);
        setCurrentChunk(codeIdx);
        _executed[codeIdx] = 2;
        updateExecuted(_executed);
      }
    }
    setExecuting(false);
  }

  const runBlock = async (blockIdx: number, codeIdx: number) => {
    setExecuting(true);
  
    const filteredCode = code.filter((c, cidx) => c.type === 'code' && cidx === blockIdx);
    for (let [_idx, chunk] of filteredCode.entries()) {
      setExecuted({...executed, [codeIdx]: 1});
      await executor.executeChunk(chunk, codeIdx - 1, setLogs);
      setCurrentChunk(Math.max(codeIdx, currentChunk));
      setExecuted({...executed, [codeIdx]: 2});
    }
    setExecuting(false);
  }

  const deleteBlock = (blockIdx: number, _codeIdx: number) => {
    if (window.confirm('Do you want to delete this block?')) {
      const newCode = [...code].filter((_c, i) => i !== blockIdx);
      setCode(newCode);
      setLogs([]);
      setExecuted({});
      // codeIdx = 0;
      setCurrentChunk(NaN);
    }
  };

  const addBlock = (blockIdx:number = NaN) => () => {
    if(isNaN(blockIdx)) {
      setCode([...code, {
        content: '',
        type: 'code',
        uuid: crypto.randomUUID()
      }])
    }
  }

  const saveCodeToIndex = (index: number) => (codeStr: string): void => {
    const updatedCode = [...code];
    updatedCode[index].content = codeStr;
    setCode(updatedCode);
  }
  
  return (
    <>
    <Header
      executing={executing}
      handleSelectFolder={handleSelectFolder}
      runAllBlocks={runAllBlocks}
      addBlock={addBlock}
    />
    <div className="container">
      
      {files.length > 0 && (
        <div className='files-list-select'>
          <label htmlFor="fileslist">File:</label>
          <div>
            <Select
              options={files.map((file:FileType) => ({label: file.name, value: file.name}))}
              placeholder="Select a file"
              onChange={(file) => {
                setLoadingFile(true);
                setTimeout(async () => {
                  // @ts-expect-error
                  const fileContent = await window.electronAPI.openFile(dir, file?.value);
                  setCode(new JavaScriptCode(fileContent).getArray());
                  setLogs([]);
                  setCurrentChunk(NaN);
                  setExecuted({});
                  setExecuting(false);
                  setLoadingFile(false);
                  executor = new ChunkedExecutor();
                }, 0);
              }}
            />
          </div>
          <button data-title="New File"><AiOutlineFileAdd /></button>
        </div>
      )}
      
      {loadingFile ? <h1>Loading file...</h1> : <NoteEditor
        code={code}
        logs={logs}
        activeBlock={activeBlock}
        setActiveBlock={setActiveBlock}
        executing={executing}
        runBlock={runBlock}
        executed={executed}
        addBlock={addBlock}
        deleteBlock={deleteBlock}
        saveCodeToIndex={saveCodeToIndex}
      />}
    </div>
  </>
  )
}

export default App
