import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
} from '@mdxeditor/editor'
import Editor from 'react-simple-code-editor';
import { AiTwotoneDelete, AiTwotoneFileText, AiTwotonePlayCircle } from 'react-icons/ai';
import { TbArrowAutofitDown, TbArrowAutofitUp, TbTableDown, TbTableImport } from 'react-icons/tb';
import { highlight, languages } from 'prismjs';
import { consoleToDivs } from '../utils/console';
import { ConsoleLogType, Executed } from "../types.d";

const NoteEditor = ({
  code,
  addBlock,
  logs,
  activeBlock,
  setActiveBlock,
  runBlock,
  executed,
  executing,
  saveCodeToIndex,
  deleteBlock
}: {
  code: SplittedCode[],
  logs: ConsoleLogType[],
  activeBlock: number,
  setActiveBlock: Function,
  addBlock: Function,
  deleteBlock: Function,
  saveCodeToIndex: Function,
  runBlock: Function,
  executed: Executed,
  executing: boolean
}) => {
  let codeIdx = 0;
  return (
    <div id="editor">
    {code.map((item:SplittedCode, index: number) => {
      if (item.type === 'code') {
        codeIdx++;
        const chunkStatus = executed[codeIdx] === 2 ? 'done' : executed[codeIdx] === 1 ? 'run' : 'wait';
        const filteredLogs = logs.filter(log => log.chunkIdx === codeIdx - 1);
        return (
          <div
            key={item.uuid}
            onClick={({ target }: any) => {
              if (target?.nodeName !== 'BUTTON') {
                setActiveBlock(index)
              }
            }}
          >
            <div 
              className={`chunk-block chunk-status-${chunkStatus}${activeBlock === index ? ' chunk-block-active' : ''}`}
            >
              <div className='chunk-actions'>
                <div className='chunk-actions-sticky'>
                  <div className={`chunk-status`}>
                    In: {codeIdx}
                  </div>
                  <div>
                    <button
                      data-title="Run Block"
                      onClick={runBlock.bind(undefined, index, codeIdx)}
                      id={`run-btn-${index}`}
                      disabled={executing}
                    >
                      <AiTwotonePlayCircle />
                      Run
                    </button>
                  </div>
                  <div className='flex'>
                    <button
                      disabled={executing}
                      data-title="Add Block Above"
                      onClick={runBlock.bind(undefined, index, codeIdx)}
                    >
                      <TbTableImport />
                    </button>
                    <button
                      data-title="Add Block Below"
                      onClick={addBlock(index)}
                      disabled={executing}
                    >
                      <TbTableDown />
                    </button>
                    <button
                      data-title="Move Block Up"
                      onClick={runBlock.bind(undefined, index, codeIdx)}
                      disabled={executing}
                    >
                      <TbArrowAutofitUp />
                    </button>
                    <button
                      data-title="Move Block Down"
                      onClick={runBlock.bind(undefined, index, codeIdx)}
                      disabled={executing}
                    >
                      <TbArrowAutofitDown />
                    </button>
                  </div>
                  <div className='flex'>
                    <button
                      data-title="Convert to Text"
                      onClick={deleteBlock.bind(undefined, index, codeIdx)}
                      disabled={executing}
                    >
                      <AiTwotoneFileText />
                      To Text
                    </button>
                    <button
                      data-title="Delete Block"
                      onClick={deleteBlock.bind(undefined, index, codeIdx)}
                      disabled={executing}
                      className='btn-delete'
                    >
                      <AiTwotoneDelete />
                    </button>
                  </div>
                </div>
              </div>
              <div
                className='code'
                data-codeblock={codeIdx}
              >
                <Editor
                  value={item.content}
                  highlight={code => highlight(code, languages.js, 'javascript')}
                  onValueChange={saveCodeToIndex(index)}
                  padding={10}
                  tabSize={4}
                  readOnly={executing}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 14,
                    lineHeight: '1.5rem'
                  }}
                />
              </div>
            </div>
            {filteredLogs.length > 0 && (<div className="console-logs-block">
              <div className='console-logs-actions'>Out: {codeIdx}</div>
              <div className="console-logs">{consoleToDivs(filteredLogs)}</div>
            </div>)}
          </div>
        );
      }

      return (
        <div
          key={item.uuid}
          onClick={() => setActiveBlock(index)}
          className={`chunk-block${activeBlock === index ? ' chunk-block-active' : ''}`}
        >
          <MDXEditor
            markdown={item.content}
            className="comment"
            contentEditableClassName="my-prose-class"
            onChange={saveCodeToIndex(index)}
            readOnly={executing}
            plugins={[
              // Example Plugin Usage
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin()
            ]}
          />
        </div>
      )
    })}
    </div>
  )
};

export default NoteEditor;
