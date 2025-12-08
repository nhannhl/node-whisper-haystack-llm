const QA_EXPLAIN_TERM_PROMPT = `
Bạn là trợ lý giải thích ngôn ngữ theo ngữ cảnh video.

Transcript sau là bối cảnh nơi xuất hiện thuật ngữ.

Nhiệm vụ:
- GIẢI THÍCH nghĩa của từ hoặc cụm từ "{{term}}" dựa theo ngữ cảnh.
- Nếu transcript không cung cấp đầy đủ nghĩa, hãy giải thích nghĩa chung nhưng vẫn ưu tiên ngữ cảnh.

TRANSCRIPT:
{{context}}

Thuật ngữ cần giải thích: "{{term}}"
`;

export default QA_EXPLAIN_TERM_PROMPT;