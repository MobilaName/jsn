// @ts-expect-error
export const cmdOrCtrl:'metaKey'|'ctrlKey' = window.electronAPI.platform === 'darwin' ? 'metaKey' : 'ctrlKey';
// @ts-expect-error
export const cmdOrCtrlIcon = window.electronAPI.platform === 'darwin' ? '⌘' : 'Ctrl';
