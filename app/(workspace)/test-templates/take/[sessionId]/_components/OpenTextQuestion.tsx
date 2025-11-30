'use client';

import React from 'react';
import { SessionQuestion } from '@/types/domain';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface OpenTextQuestionProps {
  question: SessionQuestion;
  value: string;
  onChange: (value: string) => void;
}

const MIN_CHARACTERS = 20;
const MAX_CHARACTERS = 2000;

export default function OpenTextQuestion({
  question,
  value,
  onChange,
}: OpenTextQuestionProps) {
  const charCount = value.length;
  const isValid = charCount >= MIN_CHARACTERS;
  const isNearLimit = charCount >= MAX_CHARACTERS * 0.9;

  const getPlaceholder = () => {
    switch (question.questionType) {
      case 'BEHAVIORAL_EXAMPLE':
        return 'Опишите конкретную ситуацию, ваши действия и результат...';
      case 'SELF_REFLECTION':
        return 'Поделитесь своими мыслями и размышлениями...';
      case 'PEER_FEEDBACK':
        return 'Предоставьте конструктивную обратную связь...';
      default:
        return 'Введите ваш ответ...';
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="answer-text" className="sr-only">
        Ваш ответ
      </Label>
      
      <Textarea
        id="answer-text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARACTERS))}
        placeholder={getPlaceholder()}
        className="min-h-[150px] resize-y"
        aria-describedby="char-counter"
      />
      
      <div className="flex justify-between items-center text-xs">
        <span className={charCount < MIN_CHARACTERS ? 'text-muted-foreground' : 'text-green-600'}>
          {charCount < MIN_CHARACTERS 
            ? `Минимум ${MIN_CHARACTERS} символов (осталось ${MIN_CHARACTERS - charCount})`
            : '✓ Достаточно символов'}
        </span>
        
        <span 
          id="char-counter"
          className={isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}
        >
          {charCount}/{MAX_CHARACTERS}
        </span>
      </div>

      {question.questionType === 'BEHAVIORAL_EXAMPLE' && (
        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
          <p className="font-medium mb-1">Подсказка:</p>
          <p>Используйте метод STAR: Ситуация → Задача → Действие → Результат</p>
        </div>
      )}
    </div>
  );
}
