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
import { useEffect } from 'react';

const NoteEditor = ({
  code,
  logs,
  activeBlock,
  setActiveBlock,
  runBlock,
  executed,
  executing,
  saveCodeToIndex,
  deleteBlock,
  convertToText,
  convertToCode,
  moveBlock,
  addDirectionBlock
}: {
  code: SplittedCode[],
  logs: ConsoleLogType[],
  activeBlock: number,
  setActiveBlock: Function,
  deleteBlock: Function,
  saveCodeToIndex: Function,
  runBlock: Function,
  executed: Executed,
  executing: boolean,
  convertToText: Function,
  convertToCode: Function,
  moveBlock: Function,
  addDirectionBlock: Function
}) => {
  let codeIdx = 0;

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const aBlock = Math.max(activeBlock, 0);
    if (event.shiftKey && event.ctrlKey) {
      if (key === ',') {
        const selectorPrefix = `[data-idx="${activeBlock - 1}"]`;
        if (aBlock > 0) {
          setActiveBlock(activeBlock - 1);
          let block = document.querySelector(`${selectorPrefix} textarea`);

          if (!block) {
            block = document.querySelector(`${selectorPrefix} div[aria-label="editable markdown"]`)
          }
          
          // @ts-ignore
          block?.focus();
        }
      } 
      if (key === '.') {
        const selectorPrefix = `[data-idx="${activeBlock + 1}"]`;
        if (aBlock <= code.length - 2) {
          setActiveBlock(activeBlock + 1);
          let block = document.querySelector(`${selectorPrefix} textarea`);

          if (!block) {
            block = document.querySelector(`${selectorPrefix} div[aria-label="editable markdown"]`)
          }
          
          // @ts-ignore
          block?.focus();
        }
      }
      if (key === 'enter' && activeBlock) {
        document.getElementById(`run-btn-${activeBlock}`)?.click();
        event.preventDefault();
      }
      event.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [activeBlock, code.length]);

  return (
    <div id="editor">
    {code.map((item:SplittedCode, index: number) => {
      if (item.type === 'code') {
        codeIdx++;
        const chunkStatus = executed[codeIdx] === 2 ? 'done' : executed[codeIdx] === 1 ? 'run' : 'wait';
        const filteredLogs = logs.filter(log => log.chunkIdx === codeIdx - 1);
        return (
          <div
            data-idx={index}
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
                </div>
              </div>
              <div
                className='code'
                data-codeblock={codeIdx}
              >
                <div className='code-actions'>
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
                      onClick={addDirectionBlock.bind(undefined, 'up', index)}
                    >
                      <TbTableImport />
                    </button>
                    <button
                      data-title="Add Block Below"
                      disabled={executing}
                      onClick={addDirectionBlock.bind(undefined, 'down', index)}
                    >
                      <TbTableDown />
                    </button>
                    <button
                      data-title="Move Block Up"
                      onClick={moveBlock.bind(undefined, 'up', index)}
                      disabled={executing}
                    >
                      <TbArrowAutofitUp />
                    </button>
                    <button
                      data-title="Move Block Down"
                      onClick={moveBlock.bind(undefined, 'down', index)}
                      disabled={executing}
                    >
                      <TbArrowAutofitDown />
                    </button>
                  </div>
                  <div className='flex'>
                    <button
                      data-title="Convert to Text"
                      onClick={convertToText.bind(undefined, index)}
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
          data-idx={index}
          key={item.uuid}
          onClick={() => setActiveBlock(index)}
          className={`md-editor chunk-block${activeBlock === index ? ' chunk-block-active' : ''}`}
        >
          <div style={{flex:1}}>
            <div className='md-actions'>
              <div className='flex'>
                <button
                  disabled={executing}
                  data-title="Add Block Above"
                  onClick={addDirectionBlock.bind(undefined, 'up', index)}
                >
                  <TbTableImport />
                </button>
                <button
                  data-title="Add Block Below"
                  onClick={addDirectionBlock.bind(undefined, 'down', index)}
                  disabled={executing}
                >
                  <TbTableDown />
                </button>
                <button
                  data-title="Move Block Up"
                  onClick={moveBlock.bind(undefined, 'up', index)}
                  disabled={executing}
                >
                  <TbArrowAutofitUp />
                </button>
                <button
                  data-title="Move Block Down"
                  onClick={moveBlock.bind(undefined, 'down', index)}
                  disabled={executing}
                >
                  <TbArrowAutofitDown />
                </button>
              </div>
              <div className='flex'>
                <button
                  data-title="Convert to Code"
                  onClick={convertToCode.bind(undefined, index)}
                  disabled={executing}
                >
                  <AiTwotoneFileText />
                  To Code
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
        </div>
      )
    })}
    </div>
  )
};

export default NoteEditor;
