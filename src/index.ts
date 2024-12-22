import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { glob } from 'glob';
import ignore from 'ignore';
import { isBinary } from './is-binary';

const ignores = [
  ".config.json",
  ".config.ts",
  ".config.js",
  ".gitignore",
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "bun.lockb",
  "bun.lock",
  "LICENSE",
  "CONTRIBUTING",
  "CODE_OF_CONDUCT",
  ".svg",
  "tsconfig.",
  "repocat.md",
  "node_modules",
];

function createFileTree(files: string[]) {
  const tree: Record<string, string[]> = {};
  for (const file of files) {
    const path = file.split('/');
    const fileName = path.pop()!;
    const dir = path.join('/');
    tree[dir] = tree[dir] || [];
    tree[dir].push(fileName);
  }
  return tree;
}

function renderFileTree(tree: Record<string, string[]>, indent = 0) {
  let output = '';
  const dirs = Object.keys(tree).sort();
  
  for (const dir of dirs) {
    if (dir) {
      output += '  '.repeat(indent) + '📁 ' + dir.split('/').pop() + '\n';
    }
    
    const files = tree[dir].sort();
    for (const file of files) {
      const ind = dir ? indent + 1 : indent;
      output += '  '.repeat(ind) + '📄 ' + file + '\n';
    }
    
    // サブディレクトリを再帰的にレンダリング
    const subdirs = dirs.filter(d => d.startsWith(dir + '/'));
    for (const subdir of subdirs) {
      const subtree = { [subdir]: tree[subdir] };
      output += renderFileTree(subtree, indent + 1);
    }
  }
  
  return output;
}

function sanitizeContent(content: string) {
  return content.replace(/\`\`\`/g, '\\`\\`\\`\n');
}

const gitignoreContent = readFileSync('.gitignore', 'utf-8');
const ig = ignore().add(gitignoreContent);

const files = glob.sync('**/*', { nodir: true, dot: true })
  .filter(file => !file.startsWith('.git'))
  .filter(file => !ignores.find(ignore => file.includes(ignore)))
  .filter(file => !ig.ignores(file));

let output = '';

output += `# file structure\n\n`;
const tree = createFileTree(files);
output += renderFileTree(tree);
output += '\n';
output += `# file contents\n\n`;

for (const file of files) {
  if (isBinary(file)) {
    continue;
  }
  const ext = file.split('.').pop()!;

  try {
    const content = readFileSync(file, 'utf-8');
    output += `file: ${file}\n\`\`\`${ext}\n${sanitizeContent(content)}\n\`\`\`\n\n`;
  } catch (error) {
    console.error(`Error reading file ${file}: ${error}`);
  }
}

await writeFile('repocat.md', output);

console.log('\x1b[32mWrote to repocat.md\x1b[0m');

