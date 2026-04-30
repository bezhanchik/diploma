// src/assets/components/EditModal.tsx
import { useState, useEffect } from 'react';

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; status: string }) => void;
  initialTitle: string;
  initialStatus: string;
  isLoading: boolean;
  errors?: { title?: string; status?: string };
};

export default function EditModal({
  isOpen,
  onClose,
  onSubmit,
  initialTitle,
  initialStatus,
  isLoading,
  errors = {},
}: EditModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState(initialStatus);
  const [localErrors, setLocalErrors] = useState(errors);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setStatus(initialStatus);
      setLocalErrors({});
    }
  }, [isOpen, initialTitle, initialStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, status });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Редактировать мероприятие</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (localErrors.title) setLocalErrors({ ...localErrors, title: undefined });
              }}
              className={`w-full border rounded-xl px-4 py-2 ${localErrors.title ? 'border-red-500' : 'border-slate-300'}`}
            />
            {localErrors.title && (
              <p className="text-red-500 text-sm mt-1">{localErrors.title}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2"
            >
              <option value="">Без статуса</option>
              <option value="draft">Черновик</option>
              <option value="active">Активно</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-xl hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-slate-900 text-white rounded-xl py-2 disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}