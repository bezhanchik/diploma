import axios from 'axios';
import { store } from '../store/store';

const API_URL = 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    if (detail) {
      if (typeof detail === 'string') {
        return Promise.reject(new Error(detail));
      }
      // Pydantic validation errors (422) — array of {msg, loc}
      if (Array.isArray(detail)) {
        const fieldLabels: Record<string, string> = {
          email: 'Email',
          password: 'Пароль',
          first_name: 'Имя',
          last_name: 'Фамилия',
        };
        const msgMap: Record<string, string> = {
          'string_too_short': 'слишком короткое',
          'value_error': 'некорректное значение',
          'missing': 'обязательное поле',
          'value is not a valid email address': 'некорректный email',
        };
        const messages = detail.map((d: { msg: string; type?: string; loc?: string[] }) => {
          const field = d.loc?.find((s) => s !== 'body') ?? '';
          const label = fieldLabels[field] ?? field;
          const msg = msgMap[d.type ?? ''] ?? d.msg;
          return label ? `${label}: ${msg}` : msg;
        });
        return Promise.reject(new Error(messages.join('. ')));
      }
    }
    return Promise.reject(error);
  }
);