import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const IGNORE_DIRS = ['node_modules', '.git', '.github', 'dist', 'build'];
const IGNORE_FILES = ['generate-3d-map.mjs', '3d-map.html', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];

const nodes = [];
const links = [];

function getRelativePath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, '/');
}

function traverseDirectory(currentPath, parentNodeId = null) {
  const stats = fs.statSync(currentPath);
  const isDirectory = stats.isDirectory();
  const id = getRelativePath(currentPath) || '/';
  const name = path.basename(currentPath) || 'Website-25 (Root)';

  if (id !== '/') {
    if (isDirectory && IGNORE_DIRS.includes(name)) return;
    if (!isDirectory && IGNORE_FILES.includes(name)) return;
  }

  // Create Node
  nodes.push({
    id,
    name,
    type: isDirectory ? 'directory' : 'file',
    val: isDirectory ? 5 : 2, // Size in graph
  });

  // Link to parent
  if (parentNodeId !== null) {
    links.push({
      source: parentNodeId,
      target: id,
      type: 'hierarchy'
    });
  }

  if (isDirectory) {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      traverseDirectory(path.join(currentPath, item), id);
    }
  } else {
    // If it's a JS/TS file, extract imports
    if (/\.(js|jsx|ts|tsx)$/.test(name)) {
      extractImports(currentPath, id);
    }
  }
}

function extractImports(filePath, fileId) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Basic regex for imports: import ... from 'path'; or import 'path';
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"](.*?)['"]/g;
    const requireRegex = /require\(['"](.*?)['"]\)/g;

    const findLinks = (regex) => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        let importPath = match[1];
        if (importPath.startsWith('.')) {
          // Resolve relative import to absolute path
          let resolvedAbsPath = path.resolve(path.dirname(filePath), importPath);
          
          // Try to guess extension if missing
          let finalAbsPath = resolvedAbsPath;
          if (!fs.existsSync(finalAbsPath)) {
            if (fs.existsSync(resolvedAbsPath + '.js')) finalAbsPath += '.js';
            else if (fs.existsSync(resolvedAbsPath + '.jsx')) finalAbsPath += '.jsx';
            else if (fs.existsSync(resolvedAbsPath + '/index.js')) finalAbsPath += '/index.js';
            else if (fs.existsSync(resolvedAbsPath + '/index.jsx')) finalAbsPath += '/index.jsx';
          }

          if (fs.existsSync(finalAbsPath)) {
            const targetId = getRelativePath(finalAbsPath);
            links.push({
              source: fileId,
              target: targetId,
              type: 'import'
            });
          }
        }
      }
    };

    findLinks(importRegex);
    findLinks(requireRegex);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
}

console.log('Traversing directory tree...');
traverseDirectory(rootDir);

// Filter links to make sure targets exist (in case of dynamic/unresolved imports)
const validNodes = new Set(nodes.map(n => n.id));
const validLinks = links.filter(l => validNodes.has(l.source) && validNodes.has(l.target));

const graphData = { nodes, links: validLinks };

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project 3D Dependency Map</title>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background-color: #000011; font-family: sans-serif; }
    #3d-graph { width: 100vw; height: 100vh; }
    #ui { position: absolute; top: 10px; left: 10px; color: white; z-index: 10; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; }
  </style>
  <script src="https://unpkg.com/3d-force-graph"></script>
</head>
<body>
  <div id="ui">
    <h2>Project Graph</h2>
    <p>Scroll to zoom, drag to rotate.</p>
    <div>
      <span style="color: #64b5f6;">●</span> Folders
      <br>
      <span style="color: #81c784;">●</span> Files
      <br>
      <span style="color: #ffffff;">—</span> Hierarchy Links
      <br>
      <span style="color: #ffb74d; border-bottom: 2px dashed #ffb74d">---</span> Import Links
    </div>
  </div>
  <div id="3d-graph"></div>

  <script>
    const gData = ${JSON.stringify(graphData)};

    const Graph = ForceGraph3D()(document.getElementById('3d-graph'))
      .graphData(gData)
      .nodeLabel('name')
      .nodeColor(node => node.type === 'directory' ? '#64b5f6' : '#81c784')
      .nodeRelSize(4)
      .nodeVal('val')
      .linkColor(link => link.type === 'hierarchy' ? 'rgba(255,255,255,0.2)' : 'rgba(255, 183, 77, 0.8)')
      .linkWidth(link => link.type === 'hierarchy' ? 1 : 2)
      .linkDirectionalArrowLength(link => link.type === 'import' ? 3.5 : 0)
      .linkDirectionalArrowRelPos(1)
      .onNodeClick(node => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        Graph.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          3000  // ms transition duration
        );
      });
  </script>
</body>
</html>
`;

const outputPath = path.join(rootDir, 'public', '3d-map.html');
fs.writeFileSync(outputPath, htmlTemplate);
console.log('Successfully generated 3d-map.html');
