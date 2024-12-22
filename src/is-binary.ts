import { extname } from 'node:path';
import { readFileSync } from 'node:fs';

const binaryExtensions = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
  '.exe', '.dll', '.so', '.dylib',
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv',
  '.sqlite', '.db'
]);

export function isBinary(filename: string) {
  const ext = extname(filename).toLowerCase();
  if (binaryExtensions.has(ext)) {
    return true;
  }
  
  // 拡張子で判断できない場合、ファイルの先頭バイトをチェック
  try {
    const buffer = readFileSync(filename, { encoding: null, flag: 'r' });
    // NULL バイトが含まれている場合、バイナリファイルと見なす
    for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
      if (buffer[i] === 0) {
        return true;
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filename}: ${error}`);
    return true; // エラーが発生した場合、安全のためバイナリとして扱う
  }
  
  return false;
}