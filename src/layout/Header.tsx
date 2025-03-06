import { useEffect } from 'react';
import { AiTwotoneCode, AiTwotoneControl, AiTwotoneFolderOpen, AiTwotonePlayCircle, AiTwotonePropertySafety, AiTwotoneQuestionCircle, AiTwotoneSave } from 'react-icons/ai';
import { TbArrowAutofitDown } from 'react-icons/tb';

interface HeaderProps {
  executing: boolean;
  handleSelectFolder: () => void;
  runAllBlocks: () => void;
  addBlock: () => () => void;
  handleSaveFile: () => void;
}
const Header = ({ executing, handleSelectFolder, runAllBlocks, addBlock, handleSaveFile }: HeaderProps) => {

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (event.shiftKey && event.ctrlKey) {
      if (key === 'o') {
        handleSelectFolder();
      } else if (key === 's') {
        (() => handleSaveFile())();
      } else if (key === 'r') {
        runAllBlocks();
      } else if (key === 'b') {
        addBlock()();
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
        <button disabled={executing} onClick={handleSelectFolder} data-title="Open Folder (Shift + Ctrl + O)">
          <AiTwotoneFolderOpen />
        </button>
        <button disabled={executing} onClick={handleSaveFile} data-title="Save (Shift + Ctrl + S)">
          <AiTwotoneSave />
        </button>
        <button
          disabled={executing}
          data-title="Run (Shift + Ctrl + R)"
          onClick={runAllBlocks}
        >
          <AiTwotonePlayCircle />
        </button>
      </div>
      <div className="header-buttons">
        <button
          disabled={executing}
          data-title="Add Code Block (Shift + Ctrl + B)"
          onClick={addBlock()}
        >
          <TbArrowAutofitDown />
        </button>
      </div>
      <div className="header-buttons">
        <button disabled={executing} data-title="Globals &amp; Secrets">
          <AiTwotonePropertySafety />
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