export interface Lesson {
  id: string;
  title: string;
  description: string;
  targetFile: string;
  starterCode: string;
  solutionCode?: string;
  hints: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileSystemNode[];
  isOpen?: boolean;
}

export const CURRICULUM: LearningPath[] = [
  {
    id: 'path-1',
    title: 'React 基础',
    lessons: [
      {
        id: 'l1',
        title: '组件基础',
        description: '学习如何创建你的第一个 React 组件并返回一些 JSX。',
        targetFile: 'App.tsx',
        starterCode: "import React from 'react';\n\nexport default function App() {\n  // 创建一个返回带有 'Hello React' 的 div 的组件\n  return (\n    <div>\n      \n    </div>\n  );\n}",
        hints: ['在 div 内部使用 <h1> 标签', '检查 export default 语句']
      },
      {
        id: 'l2',
        title: 'Hooks 状态管理',
        description: '了解如何使用 useState 来管理交互。',
        targetFile: 'Counter.tsx',
        starterCode: "import React, { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => {}}>\n      计数: {count}\n    </button>\n  );\n}",
        hints: ['在 onClick 处理程序中使用 setCount']
      }
    ]
  },
  {
    id: 'path-2',
    title: 'AI 工程',
    lessons: [
      {
        id: 'l3',
        title: '提示词链',
        description: '学习如何构建提示词以实现高效的 AI 代码重构。',
        targetFile: 'AIModule.ts',
        starterCode: "export const aiRefactor = async (code: string) => {\n  // 在此处实现提示词逻辑\n}",
        hints: ['定义清晰的系统指令']
      }
    ]
  }
];

export const INITIAL_FILES: FileSystemNode[] = [
  {
    id: 'root',
    name: 'nexlearn-playground',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: '1',
        name: 'App.tsx',
        type: 'file',
        language: 'typescript',
        content: CURRICULUM[0].lessons[0].starterCode,
      },
      {
        id: 'readme',
        name: '使用指南.md',
        type: 'file',
        language: 'markdown',
        content: `# 欢迎来到 NexLearn AI\n\n您的现代开发之旅从这里开始。\n\n### 如何使用：\n1. 从侧边栏选择一个 **学习路径**。\n2. 按照 **课程详情** 面板中的说明进行操作。\n3. 随时使用 **AI 导师** 获取帮助或解释。`,
      }
    ]
  }
];
