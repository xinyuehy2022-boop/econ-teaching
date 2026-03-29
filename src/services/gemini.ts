import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI("AIzaSyCCCQ8tbYBFvZtQ6ckuYBg29TScKM5znpI");

export interface VisualStep {
  title: string;
  description: string;
  imagePrompt: string;
}

export interface TheorySlide {
  title: string;
  content: string; // Markdown content for the slide
  speakerNotes?: string; // Optional notes as if a professor is speaking
}

export interface DetailedContent {
  visualBreakdown: VisualStep[];
  theorySlides: TheorySlide[]; // PPT-style slides for the core theory
  quizzes: {
    type: 'single' | 'multiple';
    question: string;
    options: { id: string; text: string }[];
    correctAnswer: string[];
    explanation: string;
  }[];
}

export async function getDetailedLearningContent(pointTitle: string, pointDesc: string): Promise<DetailedContent | null> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `你是一位资深的西方经济学教授。请针对知识点“${pointTitle}”（描述：${pointDesc}）提供极其详尽、图文并茂且适合课堂PPT展示的学习内容。
  
要求：
1. 使用中文。
2. 提供“核心理论PPT课件”（theorySlides），包含至少5-8张幻灯片。每张幻灯片包含：
   - title: 幻灯片标题
   - content: 幻灯片正文（使用 Markdown 格式，包含要点、公式、定义等，内容要详尽，不要遗漏任何关键细节）
   - speakerNotes: 教授的讲解词（模拟课堂授课的口吻，深入浅出地解释幻灯片内容）
3. 提供一个“多媒体视觉拆解”（visualBreakdown），包含3-4个步骤。每个步骤包含：
   - title: 该步骤的主题
   - description: 该步骤的文字说明，解释图表或模型的逻辑。
   - imagePrompt: 针对该步骤的插图描述。
4. 提供丰富的互动练习（quizzes），包含至少4个单选题和2个多选题。
5. 必须以 JSON 格式返回。`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theorySlides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  speakerNotes: { type: Type.STRING }
                },
                required: ['title', 'content', 'speakerNotes']
              }
            },
            visualBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ['title', 'description', 'imagePrompt']
              }
            },
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['single', 'multiple'] },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING }
                      },
                      required: ['id', 'text']
                    }
                  },
                  correctAnswer: { type: Type.ARRAY, items: { type: Type.STRING } },
                  explanation: { type: Type.STRING }
                },
                required: ['type', 'question', 'options', 'correctAnswer', 'explanation']
              }
            }
          },
          required: ['theorySlides', 'visualBreakdown', 'quizzes']
        }
      }
    });

    const text = response.text;
    return JSON.parse(text) as DetailedContent;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}
