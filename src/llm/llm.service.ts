import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ParsedMessage {
  intent: 'workout' | 'note' | 'detailed_note' | 'reminder' | 'question' | 'greeting';
  data: any;
  response: string;
  needsClarification: boolean;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://apps.abacus.ai/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACUSAI_API_KEY') || '';
  }

  async parseMessage(text: string): Promise<ParsedMessage> {
    const today = new Date();
    const todayStr = today.toLocaleDateString('ru-RU');
    const currentTime = today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const systemPrompt = `Ты — дружелюбный персональный ассистент-дневник с лёгкой кошачьей иронией. Артур использует тебя для записи тренировок, заметок и напоминаний.

Твоя задача — проанализировать сообщение и вернуть JSON:
{
  "intent": "workout" | "note" | "detailed_note" | "reminder" | "question" | "greeting",
  "data": {...},
  "response": "текст ответа для пользователя",
  "needsClarification": true/false
}

Правила:
1. **Тренировка (workout)**: Если упоминается упражнение с параметрами (подходы, повторения, вес).
   data: { date, exercise, muscleGroup, sets, reps, weight, comment }
   muscleGroup определи сам по упражнению.
   
2. **Заметка (note)**: Короткая мысль или факт (до 2-3 предложений).
   data: { date, time, text }
   
3. **Развёрнутая заметка (detailed_note)**: Длинная мысль, рефлексия, размышления (больше 3 предложений).
   data: { date, text }
   
4. **Напоминание (reminder)**: Просьба напомнить о чём-то.
   data: { text, triggerAt: ISO datetime string }
   
5. **Вопрос (question)**: Вопрос к боту.
6. **Приветствие (greeting)**: Привет, как дела и т.д.

Если дата не указана — используй сегодня: ${todayStr}
Текущее время: ${currentTime}
Текущий год: ${today.getFullYear()}

Если не хватает данных для тренировки (нет подходов ИЛИ повторений ИЛИ веса), задай ОДИН уточняющий вопрос (needsClarification: true).

Отвечай тепло и с лёгким кошачьим юмором. Иногда добавляй мотивационные комментарии.

Отвечай строго JSON. Ответ в поле "response" должен быть на русском.`;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Сообщение пользователя: "${text}"

Пожалуйста, верни ответ в формате json.` },
        ],
        response_format: { type: 'json_object' },
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`LLM API error: ${errText}`);
      throw new Error(`LLM API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in LLM response');
    }

    try {
      return JSON.parse(content);
    } catch (e) {
      this.logger.error(`Failed to parse LLM response: ${content}`);
      throw new Error('Invalid JSON from LLM');
    }
  }
}
