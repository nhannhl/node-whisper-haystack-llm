import axios from "axios";

const LLAMA_URL = process.env.LLAMA_SERVICE_URL || "http://llama:8080";

/**
 * Calls the LLaMA service with the provided data.
 * @param {object} data - The request payload for LLaMA
 * @returns {string} - The response content from LLaMA
 */
export async function callLlama(data) {
  console.log("[LLaMA] Start");
  console.time("llama");

  const res = await axios.post(`${LLAMA_URL}/v1/chat/completions`, data);

  console.timeEnd("llama");
  console.log("[LLaMA] Raw:", res.data.choices?.[0]?.message?.content);

  return res.data.choices?.[0]?.message?.content || "";
};

export async function callLlamaForSummerize(text) {
  const requestData = {
    messages: [
      {
        role: "system",
        content: "Bạn là trợ lý AI. Hãy TÓM TẮT ngắn gọn nội dung người dùng đưa ra. Luôn trả lời bằng tiếng Việt."
      },
      {
        role: "user",
        content: [
          "Hãy tóm tắt nội dung sau thành 3–5 câu, ngắn gọn và dễ hiểu.",
          "Không tạo phụ đề, không dịch từng dòng, không giữ timestamp.",
          "",
          text,
          "",
          "Tóm tắt:"
        ].join("\n")
      }
    ],
    max_tokens: 200,
    temperature: 0.2,
    stream: false
  };

  return await callLlama(requestData);
}

export async function callLlamaForRAG(context, question) {
  const requestData = {
    messages: [
      {
        role: "system",
        content: "Bạn là trợ lý AI trả lời câu hỏi dựa vào NGỮ CẢNH. Trả lời ngắn gọn, tiếng Việt."
      },
      {
        role: "user",
        content: [
          "Dưới đây là NGỮ CẢNH:",
          "====================",
          `${context}`,
          "====================",
          "",
          "Câu hỏi cần trả lời là:",
          `${question}`,
          "",
          "Dựa vào NGỮ CẢNH, hãy trả lời ngắn gọn bằng tiếng Việt.",
          "Nếu NGỮ CẢNH không chứa thông tin liên quan, hãy nói: 'Không có thông tin trong ngữ cảnh.'"
        ].join("\n")
      }
    ],
    max_tokens: 200,
    temperature: 0.2,
    stream: false
  };
  ;

  return await callLlama(requestData);
}

