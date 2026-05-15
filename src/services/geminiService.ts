import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please ensure it is set in the Secrets panel.");
    }
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
}

export async function explainCode(code: string, language: string) {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `你是一位专业的编程导师。请使用中文分析并为学生解释以下 ${language} 代码。将其分解为简单的概念，并解释为什么要这样编写：\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "无法解释代码。请检查您的 API 密钥设置。";
  }
}

export async function getTutorHint(code: string, lessonDescription: string) {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `学生正在学习这节课: "${lessonDescription}"。\n\n他们当前的代码是:\n\`\`\`\n${code}\n\`\`\`\n\n请提供一个微妙的中文提示，不要直接给出完整答案。鼓励他们思考下一步。`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "继续努力！记得检查您的语法。";
  }
}

export async function chatWithAI(messages: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const chat = model.startChat({
      history: messages.slice(0, -1),
    });
    const result = await chat.sendMessage(messages[messages.length - 1].parts[0].text);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 处理过程中出现问题。请检查 API 密钥是否已正确配置。";
  }
}
