import { useStore } from '../../store/useStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-2xl text-sm font-medium text-white 
            flex items-center justify-between min-w-[280px] max-w-md
            transform transition-all duration-300 animate-slide-in
            pointer-events-auto
            ${toast.type === 'error' ? 'bg-red-500' : 
              toast.type === 'success' ? 'bg-green-500' : 
              toast.type === 'warning' ? 'bg-yellow-500' : 
              'bg-primary'}
          `}
        >
          <span>{toast.message}</span>
          <button 
            onClick={() => removeToast(toast.id)} 
            className="ml-3 opacity-70 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}