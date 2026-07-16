import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const IGNORE_DIRS = ['node_modules', '.git', '.github', 'dist', 'build', '.next', 'out'];
// Keep public mostly, maybe ignore output JSON if we run recursively
const IGNORE_FILES = ['generate-3d-map.mjs', '3d-map.html', 'graph-data.json', 'map-app.js', 'map-styles.css', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];

let archConfig = { folders: {}, files: {} };
try {
  const configPath = path.join(rootDir, 'architecture-config.json');
  if (fs.existsSync(configPath)) {
    archConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch(e) {
  console.warn("Could not read architecture-config.json");
}

const nodes = [];
const links = [];

function getRelativePath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, '/');
}

function getExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ext ? ext.substring(1) : 'unknown';
}

function traverseDirectory(currentPath, parentNodeId = null, depth = 0) {
  const stats = fs.statSync(currentPath);
  const isDirectory = stats.isDirectory();
  const id = getRelativePath(currentPath) || '/';
  const name = path.basename(currentPath) || 'Root';

  if (id !== '/') {
    if (isDirectory && IGNORE_DIRS.includes(name)) return null;
    if (!isDirectory && IGNORE_FILES.includes(name)) return null;
  }

  const meta = isDirectory ? (archConfig.folders[id] || {}) : (archConfig.files[id] || {});

  const node = {
    id,
    name,
    type: isDirectory ? 'directory' : 'file',
    depth,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    imports: 0, // computed later
    importedBy: 0, // computed later
    loc: 0,
    childrenCount: 0,
    extension: isDirectory ? null : getExtension(name),
    val: isDirectory ? 5 : 2, // default base value
    // Metadata injection
    difficulty: meta.difficulty || null,
    description: meta.description || null,
    maintainer: meta.maintainer || null,
    isImportant: meta.isImportant || false,
    issues: meta.issues || []
  };

  nodes.push(node);

  if (parentNodeId !== null) {
    links.push({
      source: parentNodeId,
      target: id,
      type: 'hierarchy'
    });
  }

  let folderSize = 0;

  if (isDirectory) {
    const items = fs.readdirSync(currentPath);
    let childFolders = 0;
    let childFiles = 0;

    for (const item of items) {
      const childNode = traverseDirectory(path.join(currentPath, item), id, depth + 1);
      if (childNode) {
        folderSize += childNode.size;
        node.childrenCount++;
        if (childNode.type === 'directory') childFolders++;
        else childFiles++;
      }
    }
    node.size = folderSize; // recursive folder size
    node.childFolders = childFolders;
    node.childFiles = childFiles;
    node.val = Math.max(5, Math.min(20, 5 + Math.log2(node.childrenCount + 1) * 2));
  } else {
    // Basic LOC and File analysis
    if (/\.(js|jsx|ts|tsx|css|scss|html|json|md)$/.test(name)) {
      try {
        const content = fs.readFileSync(currentPath, 'utf-8');
        node.loc = content.split('\n').length;
        node.val = Math.max(2, Math.min(10, 2 + Math.log10(node.loc + 1)));

        if (/\.(js|jsx|ts|tsx)$/.test(name)) {
          extractImports(content, currentPath, id);
        }
      } catch (e) {
        // ignore read errors
      }
    }
  }

  return node;
}

function extractImports(content, filePath, fileId) {
  try {
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"](.*?)['"]/g;
    const dynamicImportRegex = /import\(['"](.*?)['"]\)/g;
    const requireRegex = /require\(['"](.*?)['"]\)/g;

    const findLinks = (regex, linkType) => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        let importPath = match[1];
        if (importPath.startsWith('.')) {
          let resolvedAbsPath = path.resolve(path.dirname(filePath), importPath);
          
          let finalAbsPath = resolvedAbsPath;
          if (!fs.existsSync(finalAbsPath)) {
            if (fs.existsSync(resolvedAbsPath + '.js')) finalAbsPath += '.js';
            else if (fs.existsSync(resolvedAbsPath + '.jsx')) finalAbsPath += '.jsx';
            else if (fs.existsSync(resolvedAbsPath + '.ts')) finalAbsPath += '.ts';
            else if (fs.existsSync(resolvedAbsPath + '.tsx')) finalAbsPath += '.tsx';
            else if (fs.existsSync(resolvedAbsPath + '/index.js')) finalAbsPath += '/index.js';
            else if (fs.existsSync(resolvedAbsPath + '/index.jsx')) finalAbsPath += '/index.jsx';
          }

          if (fs.existsSync(finalAbsPath)) {
            const targetId = getRelativePath(finalAbsPath);
            links.push({
              source: fileId,
              target: targetId,
              type: linkType
            });
          }
        }
      }
    };

    findLinks(importRegex, 'import');
    findLinks(dynamicImportRegex, 'dynamic-import');
    findLinks(requireRegex, 'import');
  } catch (err) {
    console.error(`Error processing imports for ${filePath}:`, err);
  }
}

console.log('Traversing directory tree...');
traverseDirectory(rootDir);

// Post-process metrics
const validNodes = new Set(nodes.map(n => n.id));
const validLinks = links.filter(l => validNodes.has(l.source) && validNodes.has(l.target));

validLinks.forEach(link => {
  if (link.type === 'import' || link.type === 'dynamic-import') {
    const sourceNode = nodes.find(n => n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target);
    if (sourceNode) sourceNode.imports++;
    if (targetNode) targetNode.importedBy++;
  }
});

const graphData = { nodes, links: validLinks };

const outputDir = path.join(rootDir, 'public');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const outputPath = path.join(outputDir, 'graph-data.json');
fs.writeFileSync(outputPath, JSON.stringify(graphData, null, 2));

console.log('Successfully generated public/graph-data.json with', nodes.length, 'nodes and', validLinks.length, 'links.');
