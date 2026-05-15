import React, { useState } from 'react';
import { File, Folder, ChevronRight, ChevronDown, FileCode, FileText, FileJson } from 'lucide-react';
import { FileSystemNode } from '../types';

interface FileTreeProps {
  nodes: FileSystemNode[];
  onSelect: (node: FileSystemNode) => void;
  activeFileId?: string;
}

export default function FileTree({ nodes, onSelect, activeFileId }: FileTreeProps) {
  return (
    <div className="py-2 text-[13px] font-sans select-none overflow-x-hidden">
      {nodes.map(node => (
        <FileNode 
          key={node.id} 
          node={node} 
          onSelect={onSelect} 
          activeFileId={activeFileId} 
          level={0} 
        />
      ))}
    </div>
  );
}

function FileNode({ node, onSelect, activeFileId, level }: { 
  node: FileSystemNode, 
  onSelect: (node: FileSystemNode) => void, 
  activeFileId?: string,
  level: number 
}) {
  const [isOpen, setIsOpen] = useState(node.isOpen || false);

  const getIcon = () => {
    if (node.type === 'folder') {
      return (
        <span className="flex items-center">
          {isOpen ? <ChevronDown size={12} className="mr-1 text-text-muted opacity-50" /> : <ChevronRight size={12} className="mr-1 text-text-muted opacity-50" />}
          <Folder size={14} className="text-accent-blue mr-2 opacity-80" fill="currentColor" fillOpacity={0.1} />
        </span>
      );
    }
    
    if (node.name.endsWith('.tsx') || node.name.endsWith('.ts')) {
      return <FileCode size={14} className="text-accent-blue mr-2" />;
    }
    if (node.name.endsWith('.json')) {
      return <FileJson size={14} className="text-yellow-500 mr-2 opacity-80" />;
    }
    if (node.name.endsWith('.md')) {
       return <FileText size={14} className="text-orange-400 mr-2 opacity-80" />;
    }
    return <FileText size={14} className="text-text-muted mr-2" />;
  };

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  const isActive = activeFileId === node.id;

  return (
    <div>
      <div 
        onClick={handleClick}
        className={`flex items-center py-1.5 px-3 cursor-pointer transition-all duration-150 group border-l-2 ${
          isActive 
            ? 'bg-bg-dark/50 text-accent-blue border-accent-blue' 
            : 'text-text-muted border-transparent hover:bg-white/5 hover:text-text-main'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {getIcon()}
        <span className={`truncate ${isActive ? 'font-semibold' : ''}`}>{node.name}</span>
      </div>
      
      {node.type === 'folder' && isOpen && node.children && (
        <div className="relative">
          {/* Decorative vertical line for nested structure */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-border-main/30" 
               style={{ left: `${level * 16 + 21}px` }} />
          {node.children.map(child => (
            <FileNode 
              key={child.id} 
              node={child} 
              onSelect={onSelect} 
              activeFileId={activeFileId} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
