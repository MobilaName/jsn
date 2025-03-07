import { useState } from "react";
import { VarsAndSecretsType } from "../types";
import { AiFillPlusCircle, AiTwotoneLock, AiTwotoneUnlock } from "react-icons/ai";
import { TbTrashFilled } from "react-icons/tb";

export const VarsAndSecrets = ({ isVisible, handleCancel }: {
  isVisible: boolean,
  handleCancel: () => void
}) => {
  const storedVars:VarsAndSecretsType[] = JSON.parse(localStorage.getItem('varsAndSecrets') || '[]');
  const formattedVars = storedVars.map((varAndSecret:VarsAndSecretsType) => (
    { ...varAndSecret, value: varAndSecret.type === 'secret' ? atob(varAndSecret.value) : varAndSecret.value }
  ));
  const [vars, setVars] = useState(formattedVars);

  const handleModalSave = (event: React.FormEvent) => {
    event.preventDefault();
    const updatedVars:VarsAndSecretsType[] = vars.map((varAndSecret:VarsAndSecretsType) => (
      { ...varAndSecret, value: varAndSecret.type === 'secret' ? btoa(varAndSecret.value).replace(/=+$/g, '') : varAndSecret.value }
    ));
    localStorage.setItem('varsAndSecrets', JSON.stringify(updatedVars));
  };

  const handleChange = (field: 'name' | 'value', index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedVars = [...vars];
    updatedVars[index][field] = event.target.value;
    setVars(updatedVars);
  };

  const handleAddVar = () => {
    const updatedVars:VarsAndSecretsType[] = [...vars, { name: '', value: '', type: 'secret' }];
    setVars(updatedVars);
  };

  const handleTypeChange = (index: number) => () => {
    const updatedVars = [...vars];
    updatedVars[index].value = updatedVars[index].type === 'secret' ? '' : updatedVars[index].value;
    updatedVars[index].type = updatedVars[index].type === 'secret' ? 'var' : 'secret';
    setVars([...updatedVars]);
  };

  const deleteVar = (index: number) => () => {
    if (!confirm('Are you sure you want to delete this variable?')) return;
    const updatedVars = [...vars];
    updatedVars.splice(index, 1);
    setVars([...updatedVars]);
  };

  return (
    <dialog id="vars-and-secrets-modal" open={isVisible}>
      <form onSubmit={handleModalSave}>
        <div className="flex flex-spread vars-header">
          <h2>Variables and secrets</h2>
          <button onClick={handleAddVar} type="button" className="add-variable-btn" data-title="Add variable">
            <AiFillPlusCircle /> Add Variable
          </button>
        </div>
        <div className="vars-vars">
          <ul>
            {vars.map((varAndSecret, index) => (
              <li key={index + btoa(varAndSecret.value)}>
                <input placeholder="Variable Name" id={`name-${index}`} type="text" defaultValue={varAndSecret.name} onChange={handleChange('name', index)} />
                <input placeholder="Variable Value" id={`var-${index}`} type={varAndSecret.type === 'secret' ? 'password' : 'text'} defaultValue={varAndSecret.value} onChange={handleChange('value', index)} />
                <button
                  className="secret-toggle"
                  type="button" data-title={varAndSecret.type === 'secret' ? 'Make public' : 'Make secret'}
                  onClick={handleTypeChange(index)}
                >
                  {varAndSecret.type === 'secret' ? (
                    <AiTwotoneLock />
                  ) : (
                    <AiTwotoneUnlock />
                  )}
                </button>
                <button data-title="Delete" type="button" onClick={deleteVar(index)}>
                  <TbTrashFilled />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-spread vars-btns">
          <button onClick={handleModalSave} type="submit">Save</button>
          <button onClick={handleCancel} type="reset">Close</button>
        </div>
      </form>
    </dialog>
  );
};
