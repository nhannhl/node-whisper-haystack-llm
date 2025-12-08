const QA_SUMMARY_PROMPT = `
Bạn là trợ lý phân tích video.

Dưới đây là transcript của đoạn video trong khoảng thời gian từ {{start}} đến {{end}} giây.

Nhiệm vụ:
- TÓM TẮT nội dung chính xác, ngắn gọn.
- Không thêm nội dung không có trong transcript.
- Không suy đoán.

TRANSCRIPT:
{{context}}

Yêu cầu: Tóm tắt đoạn nội dung trên.
`;

export default QA_SUMMARY_PROMPT;