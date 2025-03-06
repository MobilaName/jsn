export const removeExtension = (name: string): string => name.split('.').slice(0, -1).join('.');
