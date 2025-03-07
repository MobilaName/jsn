// @ts-expect-error
export const cmdOrCtrl:'metaKey'|'ctrlKey' = window.electronAPI.platform === 'darwin' ? 'metaKey' : 'ctrlKey';
