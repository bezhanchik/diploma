import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { RootState } from '../store/store';
import ConfirmModal from '../assets/components/ConfirmModal';
import EditModal from '../assets/components/EditModal';

type EventItem = {
  id: number;
  title: string;
  status?: string | null;
};

type FormErrors = {
  title?: string;
  status?: string;
};

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const queryClient = useQueryClient();
  const token = useSelector((state: RootState) => state.auth.token);

  const { data: events = [], isLoading } = useQuery<EventItem[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await apiClient.get('/events');
      return data;
    },
  });

  const validateForm = (titleValue: string, statusValue: string): boolean => {
    const errors: FormErrors = {};
    const trimmedTitle = titleValue.trim();
    const titleLength = trimmedTitle.length;
    
    switch (true) {
      case !trimmedTitle:
        errors.title = 'Название мероприятия обязательно';
        break;
      case titleLength < 3:
        errors.title = 'Название должно содержать минимум 3 символа';
        break;
      case titleLength > 200:
        errors.title = 'Название не должно превышать 200 символов';
        break;
    }
    
    if (statusValue) {
      const validStatuses = ['draft', 'active', 'completed', 'cancelled'];
      switch (true) {
        case !validStatuses.includes(statusValue):
          errors.status = 'Некорректный статус';
          break;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTitle = (titleValue: string): string => {
    const trimmed = titleValue.trim();
    
    switch (true) {
      case !trimmed:
        throw new Error('Название мероприятия не может быть пустым');
      case trimmed.length < 3:
        throw new Error('Название должно содержать минимум 3 символа');
      case trimmed.length > 200:
        throw new Error('Название не должно превышать 200 символов');
      default:
        return trimmed;
    }
  };

  const createMutation = useMutation({
    mutationFn: async (eventData: { title: string; status: string }) => {
      try {
        const validatedTitle = validateTitle(eventData.title);
        
        const { data } = await apiClient.post('/events', {
          ...eventData,
          title: validatedTitle,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setTitle('');
      setStatus('');
      setFormErrors({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const { data } = await apiClient.delete(`/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setDeleteId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, status }: { id: number; title: string; status: string }) => {
      try {
        const validatedTitle = validateTitle(title);
        
        const { data } = await apiClient.put(`/events/${id}`, {
          title: validatedTitle,
          status: status || null,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setEditEvent(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm(title, status)) {
      createMutation.mutate({ title, status });
    }
  };

  const handleEditSubmit = (data: { title: string; status: string }) => {
    if (validateForm(data.title, data.status)) {
      if (!editEvent) return;
      updateMutation.mutate({ id: editEvent.id, ...data });
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      switch (error.message) {
        case 'Название мероприятия не может быть пустым':
          return 'Пожалуйста, укажите название мероприятия';
        case 'Название должно содержать минимум 3 символа':
          return 'Название слишком короткое (минимум 3 символа)';
        case 'Название не должно превышать 200 символов':
          return 'Название слишком длинное (максимум 200 символов)';
        default:
          return error.message;
      }
    }
    return 'Произошла неизвестная ошибка';
  };

  const error = 
    createMutation.error ? getErrorMessage(createMutation.error) :
    deleteMutation.error ? getErrorMessage(deleteMutation.error) :
    updateMutation.error ? getErrorMessage(updateMutation.error) : '';

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="animate-slide-up">
        <h2 className="text-2xl font-bold mb-4 animate-slide-right">
          Админ-панель
        </h2>

        <form 
          onSubmit={handleSubmit} 
          className="max-w-xl bg-white p-4 rounded-2xl shadow flex flex-col gap-4 transition-all duration-300 hover:shadow-lg"
        >
          <div className="transform transition-all duration-200 hover:scale-[1.01]">
            <input
              className={`border rounded-xl px-4 py-3 w-full transition-all duration-200 focus:ring-2 focus:ring-slate-400 focus:outline-none ${formErrors.title ? 'border-red-500 animate-shake' : 'border-slate-300'}`}
              type="text"
              placeholder="Название мероприятия *"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formErrors.title) setFormErrors({ ...formErrors, title: undefined });
              }}
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1 animate-fade-in">
                {formErrors.title}
              </p>
            )}
          </div>
          
          <div className="transform transition-all duration-200 hover:scale-[1.01]">
            <select
              className="border border-slate-300 rounded-xl px-4 py-3 w-full transition-all duration-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                if (formErrors.status) setFormErrors({ ...formErrors, status: undefined });
              }}
            >
              <option value="">Выберите статус</option>
              <option value="draft">Черновик</option>
              <option value="active">Активно</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>
            {formErrors.status && (
              <p className="text-red-500 text-sm mt-1 animate-fade-in">
                {formErrors.status}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-slate-900 text-white rounded-xl px-4 py-3 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {createMutation.isPending ? 'Создается...' : 'Создать мероприятие'}
          </button>
        </form>
      </section>

      {error && (
        <p className="text-red-500 bg-red-50 p-3 rounded-lg animate-fade-in">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12 animate-fade-in">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((item, index) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl shadow p-5 space-y-3 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="text-xl font-semibold transition-colors duration-200 hover:text-slate-700">
                {item.title}
              </h3>
              
              <p className="text-slate-500">
                {(() => {
                  switch (item.status) {
                    case 'draft': return 'Черновик';
                    case 'active': return 'Активно';
                    case 'completed': return 'Завершено';
                    case 'cancelled': return 'Отменено';
                    default: return item.status || 'Без статуса';
                  }
                })()}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setEditEvent(item)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95]"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95]"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Удалить мероприятие"
        message="Вы уверены? Это действие нельзя отменить."
        isLoading={deleteMutation.isPending}
      />

      <EditModal
        isOpen={editEvent !== null}
        onClose={() => setEditEvent(null)}
        onSubmit={handleEditSubmit}
        initialTitle={editEvent?.title || ''}
        initialStatus={editEvent?.status || ''}
        isLoading={updateMutation.isPending}
        errors={formErrors}
      />

      
    </div>
  );
}