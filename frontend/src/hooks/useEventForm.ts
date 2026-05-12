import { useState } from 'react';
import type { EventStatus } from '../types';

type FormErrors = {
  title?: string;
  status?: string;
};

const VALID_STATUSES: EventStatus[] = ['draft', 'active', 'completed', 'cancelled'];

export const validateTitle = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Название мероприятия не может быть пустым');
  if (trimmed.length < 3) throw new Error('Название должно содержать минимум 3 символа');
  if (trimmed.length > 200) throw new Error('Название не должно превышать 200 символов');
  return trimmed;
};

export const useEventForm = (initialTitle = '', initialStatus = '') => {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState(initialStatus);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const next: FormErrors = {};
    const trimmed = title.trim();

    if (!trimmed) next.title = 'Название мероприятия обязательно';
    else if (trimmed.length < 3) next.title = 'Название должно содержать минимум 3 символа';
    else if (trimmed.length > 200) next.title = 'Название не должно превышать 200 символов';

    if (status && !VALID_STATUSES.includes(status as EventStatus)) {
      next.status = 'Некорректный статус';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const reset = () => {
    setTitle('');
    setStatus('');
    setErrors({});
  };

  return { title, setTitle, status, setStatus, errors, validate, clearFieldError, reset };
};
