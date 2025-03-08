import { useEffect } from 'react';
import { AiTwotoneCode, AiTwotoneControl, AiTwotoneFolderOpen, AiTwotoneLock, AiTwotonePlayCircle, AiTwotoneQuestionCircle, AiTwotoneSave } from 'react-icons/ai';
import { TbArrowAutofitDown } from 'react-icons/tb';
import { cmdOrCtrl, cmdOrCtrlIcon } from '../utils/system';

interface HeaderProps {
  executing: boolean;
  handleSelectFolder: () => void;
  runAllBlocks: () => void;
  addBlock: () => () => void;
  handleSaveFile: () => void;
  handleShowSecrets: () => void;
}
const Header = ({ executing, handleSelectFolder, runAllBlocks, addBlock, handleSaveFile, handleShowSecrets }: HeaderProps) => {

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (event[cmdOrCtrl]) {
      if (key === 'o') {
        handleSelectFolder();
        event.preventDefault();
      } else if (key === 's') {
        (() => handleSaveFile())();
        event.preventDefault();
      } else if (key === 'r') {
        runAllBlocks();
        event.preventDefault();
      } else if (key === 'b') {
        addBlock()();
        event.preventDefault();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleSaveFile]);

  return (
    <div className="header">
      <div className="logo" data-title="JSNotes">
        <AiTwotoneCode />
        JSNotes
      </div>
      <div className="header-buttons">
        <button disabled={executing} onClick={handleSelectFolder} data-title={`Open Notebook (${cmdOrCtrlIcon} + O)`}>
          <AiTwotoneFolderOpen />
        </button>
        <button disabled={executing} onClick={handleSaveFile} data-title={`Save (${cmdOrCtrlIcon} + S)`}>
          <AiTwotoneSave />
        </button>
        <button
          disabled={executing}
          data-title={`Run (${cmdOrCtrlIcon} + R)`}
          onClick={runAllBlocks}
        >
          <AiTwotonePlayCircle />
        </button>
      </div>
      <div className="header-buttons">
        <button
          disabled={executing}
          data-title={`Add Code Block (${cmdOrCtrlIcon} + B)`}
          onClick={addBlock()}
        >
          <TbArrowAutofitDown />
        </button>
      </div>
      <div className="header-buttons">
        <button disabled={executing} data-title="Globals &amp; Secrets" onClick={handleShowSecrets}>
          <AiTwotoneLock />
        </button>
        <button disabled={executing} data-title="Settings">
          <AiTwotoneControl />
        </button>
        <button
          disabled={executing}
          data-title="Help"
          onClick={runAllBlocks}
        >
          <AiTwotoneQuestionCircle />
        </button>
      </div>
    </div>
  );
}

export default Header;