import { ExecutionContext, SplittedCode } from "../types";

export class JavaScriptCode {
  codeArray: SplittedCode[];
  executionContext: ExecutionContext;
  currentBlock: number;

  constructor(code: string) {
    this.codeArray = this.splitCode(code);
    this.executionContext = {}; // Shared context for execution
    this.currentBlock = 0; // Track executed blocks
  }

  private splitCode(code: string = ''): SplittedCode[] {
    const regex = /(\/\*[\s\S]*?\*\/|[^\/]+(?:\/(?!\*)[^\/]*)*)/g;
    const resultArray: SplittedCode[] = [];
    const baseCodeArray = code.match(regex)?.map((item: string): SplittedCode => {
      const trimmedItem = item.trim();
      return {
        type: item.startsWith('/*') ? 'comment' : 'code',
        content: item.startsWith('/*') ? trimmedItem.replace(/\/\*|\*\//g, '') : trimmedItem,
        uuid: crypto.randomUUID(),
      };
    }).filter(item => item.content !== '');

    baseCodeArray?.forEach((item: SplittedCode): void => {
      if (item.type === 'code') {
        const splittedArray = item.content.split(/\/\/\s*~~codeblock\s*\d+(\n?)/gi).map(i => i.trim()).filter(i => i);
        console.log({item, splittedArray})
        splittedArray.forEach((subItem: string) => {
          resultArray.push({
            type: 'code',
            content: subItem,
            uuid: crypto.randomUUID(),
          });
        });
      } else {
        resultArray.push({ ...item });
      }
    });

    return resultArray;
  }

  getArray(): SplittedCode[] {
    return this.codeArray;
  }

  mergeCode(): string {
    return this.codeArray.map((item, idx) =>
      item.type === 'comment'
        ? `\n/* ${item.content} */\n`
        : `\n## ~~codeblock ${idx}\n\n${item.content}`
    ).join('\n');
  }
}

