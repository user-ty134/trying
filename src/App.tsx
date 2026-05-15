/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { 
  Search, 
  Code2, 
  Settings, 
  Sparkles, 
  Cpu, 
  Play,
  RotateCcw,
  Wand2,
  BookOpen,
  Files,
  GraduationCap,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  Terminal
} from 'lucide-react';

import FileTree from './components/FileTree';
import AIChat from './components/AIChat';
import { CURRICULUM, INITIAL_FILES, FileSystemNode, Lesson } from './types';
import { explainCode, getTutorHint } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [files, setFiles] = useState<FileSystemNode[]>(INITIAL_FILES);
  const [activeFile, setActiveFile] = useState<FileSystemNode>(INITIAL_FILES[0].children![0]);
  const [currentLesson, setCurrentLesson] = useState<Lesson>(CURRICULUM[0].lessons[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lessonFeedback, setLessonFeedback] = useState<string | null>(null);

  const handleFileSelect = (node: FileSystemNode) => {
    setActiveFile(node);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!value) return;
    
    const updateNode = (nodes: FileSystemNode[]): FileSystemNode[] => {
      return nodes.map(n => {
        if (n.id === activeFile.id) return { ...n, content: value };
        if (n.children) return { ...n, children: updateNode(n.children) };
        return n;
      });
    };
    
    setFiles(updateNode(files));
    setActiveFile({ ...activeFile, content: value });
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setLessonFeedback(null);
    // Automatically update code if it matches the lesson target
    if (lesson.targetFile === activeFile.name) {
      handleCodeChange(lesson.starterCode);
    }
  };

  const getHint = async () => {
    setIsProcessing(true);
    const hint = await getTutorHint(activeFile.content || '', currentLesson.description);
    setLessonFeedback(hint);
    setIsProcessing(false);
  };

  const runCode = () => {
    setLessonFeedback("System: Code executed. Output: 'Hello React' found in DOM. Success!");
  };

  return (
    <div className="flex h-screen w-full bg-bg-dark overflow-hidden flex-col select-none">
      {/* Top Bar */}
      <div className="h-10 bg-bg-sidebar border-b border-border-main flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-accent-ai font-bold">
            <GraduationCap size={20} />
            <span className="tracking-tighter text-sm">NEXLEARN AI</span>
          </div>
          <div className="ml-6 flex items-center gap-2 text-[10px] text-text-muted">
             <span className="bg-white/5 px-2 py-0.5 rounded border border-border-main">路径: {CURRICULUM[0].title}</span>
             <ChevronRight size={10} />
             <span className="text-text-main">课程: {currentLesson.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-text-muted opacity-60">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> MENTOR ONLINE</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-bg-dark border-r border-border-main flex flex-col items-center py-4 gap-6 shrink-0 z-20">
          <button className="text-accent-blue border-l-2 border-accent-blue pl-0.5 transition-colors">
            <GraduationCap size={20} />
          </button>
          <button className="text-text-muted hover:text-text-main transition-colors">
            <Files size={20} />
          </button>
          <button className="text-accent-ai opacity-80 hover:opacity-100 transition-opacity">
            <Sparkles size={20} />
          </button>
          <div className="mt-auto space-y-6 pb-4">
            <button className="text-text-muted hover:text-text-main transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Learning Sidebar */}
          <Panel defaultSize={20} minSize={15}>
            <div className="h-full flex flex-col bg-bg-sidebar border-r border-border-main">
              <div className="p-4 border-b border-border-main">
                <h3 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4">学习路径</h3>
                <div className="space-y-4">
                  {CURRICULUM.map(path => (
                    <div key={path.id}>
                      <div className="text-[10px] text-text-muted mb-2 font-bold opacity-60 px-1">{path.title}</div>
                      <div className="space-y-1">
                        {path.lessons.map(lesson => (
                          <button 
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson)}
                            className={`w-full text-left px-3 py-2 rounded text-xs transition-all flex items-center justify-between group ${
                              currentLesson.id === lesson.id 
                                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' 
                                : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                            }`}
                          >
                            <span className="truncate">{lesson.title}</span>
                            {currentLesson.id === lesson.id && <ChevronRight size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 flex-1">
                 <h3 className="text-xs font-bold text-text-main uppercase tracking-widest mb-2">文件浏览器</h3>
                 <FileTree 
                   nodes={files} 
                   onSelect={handleFileSelect} 
                   activeFileId={activeFile.id} 
                 />
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-px bg-border-main hover:bg-accent-blue transition-colors" />

          {/* Main Area */}
          <Panel defaultSize={80}>
            <PanelGroup direction="vertical">
              {/* Top: Lesson Context */}
              <Panel defaultSize={30} minSize={20}>
                <div className="h-full bg-bg-dark p-6 overflow-y-auto no-scrollbar border-b border-border-main">
                  <motion.div 
                    key={currentLesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl"
                  >
                    <h2 className="text-2xl font-bold text-text-main mb-2 tracking-tight">{currentLesson.title}</h2>
                    <p className="text-text-muted text-sm leading-relaxed mb-6 border-l-2 border-accent-ai/30 pl-4 py-1">
                      {currentLesson.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-bg-sidebar/50 p-4 rounded border border-border-main">
                        <div className="text-[10px] font-bold text-accent-ai mb-2 uppercase tracking-wider flex items-center gap-2">
                          <Lightbulb size={12} /> 目标
                        </div>
                        <p className="text-xs text-text-main opacity-80">
                          在 <span className="text-accent-blue font-mono">{currentLesson.targetFile}</span> 中完成代码。
                        </p>
                      </div>
                      <div className="bg-bg-sidebar/50 p-4 rounded border border-border-main">
                        <div className="text-[10px] font-bold text-emerald-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 size={12} /> 要求
                        </div>
                        <p className="text-xs text-text-main opacity-80">
                          确保输出符合所选概念。
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-px bg-border-main hover:bg-accent-blue transition-colors" />

              {/* Bottom: Editor & Console */}
              <Panel defaultSize={70}>
                <PanelGroup direction="horizontal">
                  <Panel defaultSize={65}>
                    <div className="h-full flex flex-col bg-bg-editor">
                      <div className="flex bg-bg-sidebar border-b border-border-main h-9 items-center px-4">
                        <span className="text-[10px] font-bold text-text-muted flex items-center gap-2 uppercase">
                          <Code2 size={12} /> 编辑器: {activeFile.name}
                        </span>
                        <div className="flex-1" />
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={getHint}
                            className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] text-accent-ai hover:bg-accent-ai/10 rounded transition-colors border border-accent-ai/30 font-bold"
                          >
                            <Lightbulb size={12} /> 提示
                          </button>
                          <button 
                            onClick={runCode}
                            className="flex items-center gap-1.5 px-3 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors font-bold shadow-lg shadow-emerald-900/20"
                          >
                            <Play size={12} fill="currentColor" /> 运行
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 relative">
                        <Editor
                          height="100%"
                          theme="vs-dark"
                          language={activeFile.language || 'typescript'}
                          value={activeFile.content}
                          onChange={handleCodeChange}
                          options={{
                            fontSize: 13,
                            fontFamily: 'JetBrains Mono',
                            minimap: { enabled: false },
                            automaticLayout: true,
                            padding: { top: 20 },
                            lineNumbers: 'on',
                            tabSize: 2,
                            cursorStyle: 'line',
                            renderLineHighlight: 'all',
                          }}
                          beforeMount={(monaco) => {
                            monaco.editor.defineTheme('nexlearn-dark', {
                              base: 'vs-dark',
                              inherit: true,
                              rules: [
                                { token: 'keyword', foreground: '#bc8cff' },
                                { token: 'string', foreground: '#a5d6ff' },
                              ],
                              colors: {
                                'editor.background': '#0d1117',
                              }
                            });
                          }}
                          onMount={(editor) => {
                            (window as any).monaco.editor.setTheme('nexlearn-dark');
                          }}
                        />
                        
                        <AnimatePresence>
                          {isProcessing && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-bg-dark/70 backdrop-blur-[2px] flex items-center justify-center z-10"
                            >
                              <div className="flex flex-col items-center gap-4">
                                <motion.div 
                                  animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                                  transition={{ repeat: Infinity, duration: 3 }}
                                  className="text-accent-ai"
                                >
                                  <Sparkles size={32} />
                                </motion.div>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-accent-ai uppercase">导师正在思考</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Feedback Panel */}
                      <div className="h-32 border-t border-border-main bg-bg-dark p-4 font-mono text-[11px] overflow-y-auto no-scrollbar">
                         <div className="flex items-center gap-2 mb-2 text-text-muted opacity-50 uppercase tracking-widest text-[9px] font-bold">
                           <Terminal size={10} /> 输出与反馈
                         </div>
                         {lessonFeedback ? (
                           <div className="text-text-main animate-in fade-in duration-500 whitespace-pre-wrap">
                             {lessonFeedback}
                           </div>
                         ) : (
                           <div className="text-text-muted italic opacity-40">
                             等待执行或点击获取提示...
                           </div>
                         )}
                      </div>
                    </div>
                  </Panel>

                  <PanelResizeHandle className="w-px bg-border-main hover:bg-accent-blue transition-colors" />

                  <Panel defaultSize={35}>
                    <AIChat 
                      currentCode={activeFile.content || ''} 
                      language={activeFile.language || 'typescript'}
                      onExplain={() => handleCodeChange(currentLesson.solutionCode || activeFile.content)}
                    />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-accent-blue text-white flex items-center px-3 text-[9px] justify-between z-40 font-bold uppercase tracking-tight">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 border-r border-white/20 pr-4">
            <GraduationCap size={10} /> 
            <span>进度: {(CURRICULUM.findIndex(p => p.lessons.includes(currentLesson)) + 1) * 25}%</span>
          </div>
          <span>会话时间: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-6">
          <span>{activeFile.language}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            AI 导师就绪
          </div>
        </div>
      </div>
    </div>
  );
}
