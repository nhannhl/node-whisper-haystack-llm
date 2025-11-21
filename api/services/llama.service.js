import axios from "axios";

const LLAMA_URL = process.env.LLAMA_SERVICE_URL || "http://llama:8080";

export async function callLlama(prompt) {
  console.log("[LLaMA] Start");
  console.time("llama");

  const res = await axios.post(`${LLAMA_URL}/v1/chat/completions`, {
    messages: [
      {
        role: "system",
        content: "Bạn là trợ lý AI giỏi tóm tắt nội dung ngắn gọn, chính xác, bằng tiếng Việt."
      },
      {
        role: "user",
        content: `Hãy tóm tắt ngắn gọn nội dung sau:\n\n${prompt}`
      }
    ],
    max_tokens: 150,
    temperature: 0.2,
    stream: false
  });

  console.timeEnd("llama");
  console.log("[LLaMA] Raw:", res.data.choices?.[0]?.message?.content);

  return res.data.choices?.[0]?.message?.content || "";
}
