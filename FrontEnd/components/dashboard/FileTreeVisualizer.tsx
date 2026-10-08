import React, { useState, useMemo } from 'react';

interface FileNode {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

interface TreeNode {
  name: string;
  fullPath: string;
  type: 'blob' | 'tree';
  children: Record<string, TreeNode>;
  isExpanded?: boolean;
}

interface FileTreeVisualizerProps {
  files: FileNode[];
  onFileSelect: (path: string) => void;
  selectedFile?: string;
}

export default function FileTreeVisualizer({ files, onFileSelect, selectedFile }: FileTreeVisualizerProps) {
  // Parse files if it was sent as a JSON string
  const parsedFiles = useMemo(() => {
    let p = files;
    if (typeof files === 'string') {
      try {
        p = JSON.parse(files);
      } catch (e) {
        p = [];
      }
    }
    return Array.isArray(p) ? p : [];
  }, [files]);

  // Build nested tree from flat paths
  const root = useMemo(() => {
    const treeRoot: TreeNode = { name: 'root', fullPath: '', type: 'tree', children: {} };
    
    parsedFiles.forEach(file => {
      const parts = file.path.split('/');
      let current = treeRoot;
      
      parts.forEach((part, index) => {
        if (!current.children[part]) {
          const isLast = index === parts.length - 1;
          current.children[part] = {
            name: part,
            fullPath: parts.slice(0, index + 1).join('/'),
            type: isLast ? file.type : 'tree',
            children: {},
            isExpanded: false
          };
        }
        current = current.children[part];
      });
    });
    
    return treeRoot;
  }, [parsedFiles]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTree = (node: TreeNode, depth: number = 0) => {
    const isRoot = depth === 0;
    const children = Object.values(node.children).sort((a, b) => {
      // Directories first
      if (a.type === 'tree' && b.type === 'blob') return -1;
      if (a.type === 'blob' && b.type === 'tree') return 1;
      return a.name.localeCompare(b.name);
    });

    if (children.length === 0) return null;

    return (
      <div className={`relative ${isRoot ? 'p-4' : 'pl-8'}`}>
        {!isRoot && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-800 ml-3.5 -z-10" />
        )}
        <div className="space-y-2">
          {children.map((child, index) => {
            const isExpanded = expandedNodes.has(child.fullPath);
            const isSelected = selectedFile === child.fullPath;
            const isLast = index === children.length - 1;
            
            return (
              <div key={child.fullPath} className="relative">
                {!isRoot && (
                  <div className="absolute left-[-20px] top-4 w-[20px] h-px bg-zinc-800 -z-10" />
                )}
                <div 
                  className={`
                    flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300
                    ${isSelected ? 'bg-[#1ef2c1]/10 border border-[#1ef2c1]/50 shadow-[0_0_10px_rgba(30,242,193,0.2)]' : 'bg-[#0d1117] border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900'}
                  `}
                  onClick={() => {
                    if (child.type === 'tree') {
                      toggleNode(child.fullPath);
                    } else {
                      onFileSelect(child.fullPath);
                    }
                  }}
                >
                  <div className={`
                    w-6 h-6 rounded flex items-center justify-center text-xs
                    ${child.type === 'tree' ? 'bg-zinc-800 text-zinc-300' : isSelected ? 'bg-[#1ef2c1] text-black' : 'bg-zinc-900 text-zinc-500'}
                  `}>
                    {child.type === 'tree' ? (isExpanded ? '📂' : '📁') : '📄'}
                  </div>
                  <span className={`text-sm font-mono ${isSelected ? 'text-[#1ef2c1] font-bold' : 'text-zinc-300'}`}>
                    {child.name}
                  </span>
                </div>
                
                {child.type === 'tree' && isExpanded && (
                  <div className="mt-2">
                    {renderTree(child, depth + 1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!parsedFiles || parsedFiles.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg">
        <p className="text-zinc-500 text-sm italic font-mono">No files found in this repository.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#050505] border border-zinc-800 rounded-lg overflow-x-auto p-4 custom-scrollbar">
      {renderTree(root)}
    </div>
  );
}
