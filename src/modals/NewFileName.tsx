import { useEffect, useState } from "react";

export const NewFileName = ({ isVisible, handleSave, handleCancel }: {
  isVisible: boolean,
  handleSave: (name: string) => void,
  handleCancel: () => void
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    document.getElementById('new-file-name')?.focus();

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setName(event.target.value);
  };

  const handleModalSave = (event: React.FormEvent) => {
    event.preventDefault();
    handleSave(name);
  };

  const handleModalCancel = () => {
    handleCancel();
  };

  return (
    <dialog id="new-file-name-modal" open={isVisible}>
      <form onSubmit={handleModalSave}>
        <input type="text" id="new-file-name" placeholder="New File Name" value={name} onChange={handleInputChange} />
        <button onClick={handleModalSave} type="submit">Create</button>
        <button onClick={handleModalCancel} type="reset">Cancel</button>
      </form>
    </dialog>
  );
};
