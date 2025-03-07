import { KeyboardEvent, useEffect, useState } from 'react';
import Select from 'react-select';
import { AiOutlineFileAdd } from 'react-icons/ai';
import { JavaScriptCode } from './utils/code';
import { ChunkedExecutor, mergeCode } from './utils/executor';
import './utils/utilityFunctions';

import '@mdxeditor/editor/style.css'
import 'prismjs/themes/prism.css';
import 'chartist/dist/index.css';
import { ConsoleLogType, FileType, Executed } from './types.d';
import Header from './layout/Header';
import NoteEditor from './layout/Editor';
import { removeExtension } from './utils/files';
import { NewFileName } from './modals/NewFileName';
import { VarsAndSecrets } from './modals/VarsAndSecrets';

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
  const localStorageDir = localStorage.getItem('dir') || '';
  const localStorageFile:string = localStorage.getItem('file') || '';
  const [dir, setDir] = useState<string>(localStorageDir);
  const [files, setFiles] = useState([] as FileType[]);
  const [code, setCode] = useState<SplittedCode[]>(CodeArray);
  const [currentFile, setCurrentFile] = useState<string>(localStorageFile);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [logs, setLogs] = useState<ConsoleLogType[]>([]);
  const [executing, setExecuting] = useState<boolean>(false);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [activeBlock, setActiveBlock] = useState(NaN);
  const [executed, setExecuted] = useState<Executed>({});
  const [newFileNameModal, setNewFileNameModal] = useState(false);
  const [varsAndSecretsModal, setVarsAndSecretsModal] = useState(false);

  useEffect(() => {
    if (dir) {
      (async function(dir:string) {
        // @ts-expect-error
        const [_dir, fileList]:[string, FileType[]] = await window.electronAPI.openFolder(dir);
        setDir(_dir);
        setFiles(fileList);
      })(dir);

      if (currentFile) {
        (async function(currentFile:string) {
          setLoadingFile(true);
          // @ts-expect-error
          const fileContent = await window.electronAPI.openFile(dir, currentFile);
          setCode(new JavaScriptCode(fileContent).getArray());
          setLoadingFile(false);
          executor = new ChunkedExecutor();
        })(currentFile);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dir', dir);
  }, [dir]);

  useEffect(() => {
    localStorage.setItem('file', currentFile);
  }, [currentFile]);

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
      const [dir, fileList]:[string, FileType[]] = await window.electronAPI.selectFolder();

      if (dir) {
        setDir(dir);
        setFiles(fileList);
      }
    } else {
      console.error("Electron API not available");
    }
  };

  const handleSaveFile = async () => {
    // @ts-expect-error
    if (window.electronAPI && dir && currentFile) {
      // @ts-expect-error
      const result = await window.electronAPI.saveFile(dir, currentFile, mergeCode(code));
    } else {
      console.error("Electron API not available");
    }
  }

  const handleAddFile = async (fileName: string) => {
    const fullFileName = fileName + '.js';
    // @ts-expect-error
    if (window.electronAPI && dir) {
      // @ts-expect-error
      const result = await window.electronAPI.createFile(dir, fileName);

      setLoadingFile(true);
      // @ts-expect-error
      const fileContent = await window.electronAPI.openFile(dir, fullFileName);
      setCode(new JavaScriptCode(fileContent).getArray());
      setLoadingFile(false);
      setCurrentFile(fullFileName);
      executor = new ChunkedExecutor();

      (async function(dir:string) {
        // @ts-expect-error
        const [_dir, fileList]:[string, FileType[]] = await window.electronAPI.openFolder(dir);
        setDir(_dir);
        setFiles(fileList);
      })(dir);
    } else {
      throw new Error("Electron API not available");
    }

    setNewFileNameModal(false);
  }

  const setRunBlockEvent = (event: KeyboardEvent<HTMLBodyElement>) => {
    if (event.ctrlKey && event.key === 'Enter') {
      document.getElementById(`run-btn-${activeBlock}`)?.click();
    }
  }

  const convertToText = (index: number) => {
    const updatedCode = [...code];
    updatedCode[index].type = 'comment';
    setCode(updatedCode);
  }

  const convertToCode = (index: number) => {
    const updatedCode = [...code];
    updatedCode[index].type = 'code';
    setCode(updatedCode);
  }

  const moveBlock = (dir: 'up' | 'down', index: number) => {
    const updatedCode = [...code];
    const temp = updatedCode.splice(index, 1)[0];
    updatedCode.splice(index + (dir === 'up' ? -1 : 1), 0, temp);
    setCode(updatedCode);
  }

  const addDirectionBlock = (dir: 'up' | 'down', index: number) => {
    const updatedCode = [...code];
    updatedCode.splice(index + (dir === 'up' ? 0 : 1), 0, {
      content: '',
      type: 'code',
      uuid: crypto.randomUUID()
    });
    setCode(updatedCode);
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
      handleSaveFile={handleSaveFile}
      handleShowSecrets={() => setVarsAndSecretsModal(true)}
      runAllBlocks={runAllBlocks}
      addBlock={addBlock}
    />
    <div className="container">
      
      {files.length > 0 && (
        <div className='files-list-select'>
          <label htmlFor="fileslist">File:</label>
          <div>
            <Select
              options={files.map((file:FileType) => ({label: removeExtension(file.name), value: file.name}))}
              placeholder="Select a file"
              value={{label: removeExtension(currentFile), value: currentFile}}
              onChange={(file) => {
                setLoadingFile(true);
                setTimeout(async () => {
                  // @ts-expect-error
                  const fileContent = await window.electronAPI.openFile(dir, file?.value);
                  setCurrentFile(file?.value || '');
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
          <button data-title="New File" onClick={() => setNewFileNameModal(true)}><AiOutlineFileAdd /></button>
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
        convertToText={convertToText}
        convertToCode={convertToCode}
        moveBlock={moveBlock}
        addDirectionBlock={addDirectionBlock}
      />}
    </div>
    {newFileNameModal && (
      <NewFileName
        isVisible={newFileNameModal}
        handleSave={handleAddFile}
        handleCancel={() => setNewFileNameModal(false)}
      />
    )}
    {varsAndSecretsModal && (
      <VarsAndSecrets
        isVisible={varsAndSecretsModal}
        handleCancel={() => setVarsAndSecretsModal(false)}
      />
    )}
  </>
  )
}

export default App
