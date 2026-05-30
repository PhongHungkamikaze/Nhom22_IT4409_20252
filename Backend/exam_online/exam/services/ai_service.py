import json
import re

import google.generativeai as genai
from django.conf import settings


class AIService:
    @staticmethod
    def generate_questions(content_source, num_questions, q_type):
        api_key = getattr(settings, "GEMINI_API_KEY", None)
        if not api_key:
            raise ValueError("Gemini API Key not configured")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""
        Dựa trên lĩnh vực sau sau, hãy tạo {num_questions} câu hỏi trắc nghiệm {q_type} choice.
        Yêu cầu mỗi câu hỏi có 4 lựa chọn, trong đó có đúng 1 đáp án chính xác (nếu là single) hoặc ít nhất 1 (nếu là multiple).
        Trả về kết quả dưới dạng mảng JSON thuần túy, KHÔNG có markdown, KHÔNG có văn bản giải thích.
        Cấu trúc JSON:
        [
          {{"content": "Câu hỏi...", "choices": [{{"content": "Đáp án 1", "is_correct": true}}, {{"content": "Đáp án 2", "is_correct": false}}]}}
        ]
        Văn bản nguồn:
        {content_source}
        """

        response_ai = model.generate_content(prompt)
        text = response_ai.text
        json_match = re.search(r"\[.*\]", text, re.DOTALL)
        if json_match:
            questions_data = json.loads(json_match.group())
        else:
            questions_data = json.loads(text)

        return questions_data
