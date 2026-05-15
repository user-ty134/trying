import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Wand2, BookOpen, GraduationCap } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatProps {
  currentCode: string;
  language: string;
  onApplyRefactor?: (code: string) => void;
  onExplain?: () => void;
}

export default function AIChat({ currentCode, language, onApplyRefactor, onExplain }: AIChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: '欢迎来到学习课程！我是 Lumina，您的 AI 导师。我可以为您讲解代码概念、协助逻辑思考，或者针对当前的课程提供提示。您想探索什么？' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    // Mentor persona prompt augmentation
    const finalPrompt = `你是一位耐心细致的代码导师。请尽可能使用中文回答。
    上下文 (当前文件 - ${language}):
    \`\`\`${language}
    ${currentCode}
    \`\`\`
    
    指导方针：
    1. 不要直接给出答案。
    2. 引导学生思考。
    3. 清晰地解释概念。
    
    学生的问题: ${userText}`;
    
    history.push({ role: 'user', parts: [{ text: finalPrompt }] });

    try {
      const response = await chatWithAI(history);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: '我在处理该请求时遇到了错误。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-dark border-l border-border-main">
      <div className="p-4 border-b border-border-main flex items-center justify-between bg-bg-dark/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xs font-bold flex items-center text-accent-ai tracking-widest gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-ai shadow-[0_0_10px_#bc8cff]" />
          LUMINA 导师
        </h2>
        <div className="flex gap-2">
           <button 
             onClick={onExplain}
             className="p-1.5 hover:bg-white/5 rounded transition-colors text-text-muted hover:text-text-main"
             title="获取答案 / 讲解"
           >
             <GraduationCap size={14} />
           </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] rounded-lg px-4 py-3 text-sm flex gap-3 ${
              m.role === 'user' 
                ? 'bg-bg-sidebar border border-border-main text-text-main' 
                : 'ai-bubble text-text-main shadow-sm'
            }`}>
              {m.role === 'model' && <Sparkles size={14} className="shrink-0 mt-1 text-accent-ai" />}
              <div className="whitespace-pre-wrap leading-relaxed opacity-90 overflow-hidden break-words">
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="ai-bubble rounded-lg px-4 py-3 flex gap-2 items-center">
               <motion.div 
                 animate={{ opacity: [0.3, 1, 0.3] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
               >
                 <Sparkles size={14} className="text-accent-ai" />
               </motion.div>
               <span className="text-[11px] font-bold text-accent-ai/70 tracking-widest uppercase">正在分析...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border-main bg-bg-dark/80 backdrop-blur-md">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="咨询 Lumina AI..."
            className="w-full bg-bg-sidebar border border-border-main rounded-md px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-accent-ai/50 min-h-[48px] max-h-[200px] resize-none no-scrollbar placeholder:text-text-muted/40 transition-all shadow-inner"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'inherit';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-3 text-text-muted hover:text-accent-ai disabled:opacity-20 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setInput('你能解释一下这节课的核心概念吗？')}
             className="text-[10px] font-bold bg-bg-sidebar/50 hover:bg-bg-sidebar text-text-muted hover:text-text-main px-3 py-1.5 rounded-full border border-border-main flex items-center transition-all shrink-0 uppercase tracking-tighter"
           >
             <BookOpen size={10} className="mr-1.5 opacity-60" /> 概念讲解
           </button>
           <button 
             onClick={() => setInput('有没有更好的方式来编写这个特定的函数？')}
             className="text-[10px] font-bold bg-bg-sidebar/50 hover:bg-bg-sidebar text-text-muted hover:text-text-main px-3 py-1.5 rounded-full border border-border-main flex items-center transition-all shrink-0 uppercase tracking-tighter"
           >
             <Wand2 size={10} className="mr-1.5 opacity-60" /> 最佳实践
           </button>
        </div>
      </div>
    </div>
  );
}
