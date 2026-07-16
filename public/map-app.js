// Color mapping
const colorMap = {
  directory: '#58a6ff',      // Blue
  js: '#e3b341',             // Yellow
  jsx: '#e3b341',            
  ts: '#3178c6',             // TypeScript Blue
  tsx: '#3178c6',
  css: '#ff7b72',            // Pink/Red
  scss: '#ff7b72',
  html: '#ff7b72',
  png: '#2ea043',            // Green
  jpg: '#2ea043',
  jpeg: '#2ea043',
  svg: '#2ea043',
  gif: '#2ea043',
  json: '#a371f7',           // Purple
  md: '#8b949e',             // Gray
  unknown: '#f0f6fc'         // White
};

function getNodeColor(node) {
  if (node.type === 'directory') return colorMap.directory;
  return colorMap[node.extension] || colorMap.unknown;
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Global State
let graphData = { nodes: [], links: [] };
let highlightNodes = new Set();
let highlightLinks = new Set();
let hoverNode = null;
let selectedNode = null;
let fuse;

const filters = {
  folders: true,
  js: true,
  css: true,
  media: true,
  others: true,
  orphansOnly: false
};

function isNodeVisible(node) {
  if (filters.orphansOnly && (!node.isOrphan || node.type === 'directory')) return false;
  if (node.type === 'directory') return filters.folders;
  
  const ext = node.extension;
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return filters.js;
  if (['css', 'scss', 'less'].includes(ext)) return filters.css;
  if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'ico', 'webp'].includes(ext)) return filters.media;
  return filters.others;
}

function isLinkVisible(link) {
  const sourceNode = typeof link.source === 'object' ? link.source : null;
  const targetNode = typeof link.target === 'object' ? link.target : null;
  if (sourceNode && !isNodeVisible(sourceNode)) return false;
  if (targetNode && !isNodeVisible(targetNode)) return false;
  return true;
}

// Initialize Graph
const Graph = ForceGraph3D()(document.getElementById('3d-graph'))
  .nodeVisibility(node => isNodeVisible(node))
  .linkVisibility(link => isLinkVisible(link))
  .nodeLabel(node => {
    return `<div class="scene-tooltip">
      <strong>${node.name}</strong><br>
      <small style="color: #8b949e">${node.id}</small><br>
      ${node.type === 'file' ? `Size: ${formatBytes(node.size)}<br>LOC: ${node.loc}` : `Files: ${node.childFiles || 0} | Folders: ${node.childFolders || 0}`}
    </div>`;
  })
  .nodeColor(node => {
    if (highlightNodes.size === 0) return getNodeColor(node);
    if (highlightNodes.has(node)) return getNodeColor(node);
    return 'rgba(255,255,255,0.1)';
  })
  .nodeThreeObject(node => {
    const size = node.val;
    const color = getNodeColor(node);
    const material = new THREE.MeshLambertMaterial({ 
      color, 
      transparent: true,
      opacity: (highlightNodes.size === 0 || highlightNodes.has(node)) ? 0.9 : 0.1 
    });
    
    let geometry;
    if (node.type === 'directory') {
      geometry = new THREE.BoxGeometry(size, size, size);
    } else {
      geometry = new THREE.SphereGeometry(size / 1.5, 16, 16);
    }
    
    return new THREE.Mesh(geometry, material);
  })
  .linkColor(link => {
    if (highlightLinks.size > 0 && !highlightLinks.has(link)) return 'rgba(255,255,255,0.02)';
    if (link.type === 'hierarchy') return 'rgba(255,255,255,0.15)';
    if (link.type === 'dynamic-import') return 'rgba(163, 113, 247, 0.6)'; // Purple
    return 'rgba(255, 183, 77, 0.6)'; // Orange for static imports
  })
  .linkWidth(link => {
    if (highlightLinks.size > 0 && !highlightLinks.has(link)) return 0.5;
    return link.type === 'hierarchy' ? 1 : 2;
  })
  .linkDirectionalParticles(link => (highlightLinks.has(link) || link.type !== 'hierarchy') ? 2 : 0)
  .linkDirectionalParticleWidth(2)
  .linkDirectionalParticleSpeed(0.005)
  .onNodeHover(node => {
    if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;
    document.getElementById('3d-graph').style.cursor = node ? 'pointer' : null;
  })
  .onNodeClick(node => {
    selectedNode = node;
    updateHighlight();
    updateSidebar(node);
    
    // Camera Focus
    const distance = 80;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
    Graph.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node, // lookAt
      2000  // ms transition duration
    );
  })
  .onBackgroundClick(() => {
    selectedNode = null;
    updateHighlight();
    document.getElementById('sidebar').classList.remove('active');
  });

function updateHighlight() {
  highlightNodes.clear();
  highlightLinks.clear();

  if (selectedNode) {
    highlightNodes.add(selectedNode);
    graphData.links.forEach(link => {
      if (link.source.id === selectedNode.id || link.target.id === selectedNode.id) {
        highlightLinks.add(link);
        highlightNodes.add(link.source);
        highlightNodes.add(link.target);
      }
    });
  }
  
  Graph
    .nodeColor(Graph.nodeColor())
    .linkColor(Graph.linkColor())
    .linkWidth(Graph.linkWidth())
    .linkDirectionalParticles(Graph.linkDirectionalParticles())
    .nodeThreeObject(Graph.nodeThreeObject());
}

function updateSidebar(node) {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.add('active');
  
  document.getElementById('sb-name').innerText = node.name;
  document.getElementById('sb-path').innerText = node.id;
  
  document.getElementById('sb-type').innerText = node.type === 'directory' ? 'Folder' : (node.extension ? `.${node.extension.toUpperCase()} File` : 'File');
  document.getElementById('sb-size').innerText = formatBytes(node.size);
  document.getElementById('sb-loc').innerText = node.loc > 0 ? node.loc : 'N/A';
  
  const modifiedDate = new Date(node.modified);
  document.getElementById('sb-modified').innerText = isNaN(modifiedDate) ? 'N/A' : modifiedDate.toLocaleDateString();

  // Populate Imports
  const importsList = document.getElementById('sb-imports-list');
  const importedByList = document.getElementById('sb-imported-by-list');
  importsList.innerHTML = '';
  importedByList.innerHTML = '';
  
  let importsCount = 0;
  let importedByCount = 0;

  graphData.links.forEach(link => {
    if (link.type === 'hierarchy') return; // Only show import links in sidebar
    
    if (link.source.id === node.id) {
      importsCount++;
      const li = document.createElement('li');
      li.innerHTML = `<span>${link.target.name}</span><small style="color:var(--text-secondary)">${link.type}</small>`;
      li.onclick = () => focusNodeById(link.target.id);
      importsList.appendChild(li);
    }
    
    if (link.target.id === node.id) {
      importedByCount++;
      const li = document.createElement('li');
      li.innerHTML = `<span>${link.source.name}</span><small style="color:var(--text-secondary)">${link.type}</small>`;
      li.onclick = () => focusNodeById(link.source.id);
      importedByList.appendChild(li);
    }
  });

  document.getElementById('sb-imports-count').innerText = importsCount;
  document.getElementById('sb-imported-by-count').innerText = importedByCount;
  
  document.getElementById('sb-imports-container').style.display = importsCount > 0 ? 'block' : 'none';
  document.getElementById('sb-imported-by-container').style.display = importedByCount > 0 ? 'block' : 'none';
}

function focusNodeById(id) {
  const node = graphData.nodes.find(n => n.id === id);
  if (node) {
    Graph.onNodeClick()(node);
  }
}

// Fetch Data
fetch('graph-data.json')
  .then(res => res.json())
  .then(data => {
    graphData = data;
    
    // Calculate Orphans (Files that have no imports in or out)
    let orphanCount = 0;
    graphData.nodes.forEach(node => {
      if (node.type === 'file') {
        const hasDependencies = graphData.links.some(l => 
          l.type !== 'hierarchy' && (l.source === node.id || l.target === node.id)
        );
        node.isOrphan = !hasDependencies;
        if (node.isOrphan) orphanCount++;
      }
    });

    Graph.graphData(data);
    
    // Update Stats
    document.getElementById('top-bar').style.display = 'flex';
    document.getElementById('stat-files').innerText = data.nodes.filter(n => n.type === 'file').length;
    document.getElementById('stat-folders').innerText = data.nodes.filter(n => n.type === 'directory').length;
    
    const totalLoc = data.nodes.reduce((acc, n) => acc + (n.loc || 0), 0);
    document.getElementById('stat-loc').innerText = totalLoc.toLocaleString();
    
    if (orphanCount > 0) {
      document.getElementById('stat-orphans-container').style.display = 'flex';
      document.getElementById('stat-orphans').innerText = orphanCount;
    }

    // Initialize Fuse.js for fuzzy search
    fuse = new Fuse(data.nodes, {
      keys: ['name', 'id', 'extension'],
      threshold: 0.3
    });
  });

// Search UI Logic
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', (e) => {
  const query = e.target.value;
  searchResults.innerHTML = '';
  
  if (query.trim() === '') return;
  
  const results = fuse.search(query).slice(0, 8); // top 8 results
  
  results.forEach(result => {
    const node = result.item;
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `
      <div>${node.name}</div>
      <div class="path">${node.id}</div>
    `;
    div.onclick = () => {
      focusNodeById(node.id);
      searchResults.innerHTML = '';
      searchInput.value = '';
    };
    searchResults.appendChild(div);
  });
});

// Shortcut for Search
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
});

// Filters Logic
['folders', 'js', 'css', 'media', 'others', 'orphans'].forEach(key => {
  const el = document.getElementById('filter-' + key);
  if (el) {
    el.addEventListener('change', (e) => {
      if (key === 'orphans') filters.orphansOnly = e.target.checked;
      else filters[key] = e.target.checked;
      Graph
        .nodeVisibility(Graph.nodeVisibility())
        .linkVisibility(Graph.linkVisibility());
    });
  }
});

// Physics GUI
const gui = new dat.GUI();
const physicsConfig = {
  nodeRepulsion: 120,
  linkDistance: 40
};

const fgConfig = gui.addFolder('Physics');
fgConfig.add(physicsConfig, 'nodeRepulsion', 10, 500).onChange(v => Graph.d3Force('charge').strength(-v));
fgConfig.add(physicsConfig, 'linkDistance', 10, 200).onChange(v => Graph.d3Force('link').distance(v));
fgConfig.open();
