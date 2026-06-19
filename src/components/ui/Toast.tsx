import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

/* ── Singleton store ─────────────────────────────────────── */
type ToastType = 'success' | 'error';
interface ToastItem { id: number; message: string; type: ToastType }

type Listener = (items: ToastItem[]) => void;
let _items: ToastItem[] = [];
let _listeners: Listener[] = [];
let _nextId = 1;

function publish() {
  _listeners.forEach(l => l([..._items]));
}

function add(message: string, type: ToastType) {
  const id = _nextId++;
  _items = [..._items, { id, message, type }];
  publish();
  setTimeout(() => {
    _items = _items.filter(t => t.id !== id);
    publish();
  }, 3500);
}

export const toast = {
  success: (message: string) => add(message, 'success'),
  error:   (message: string) => add(message, 'error'),
};

/* ── Toaster (render once in Layout) ────────────────────── */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    _listeners.push(setItems);
    return () => { _listeners = _listeners.filter(l => l !== setItems); };
  }, []);

  const dismiss = (id: number) => {
    _items = _items.filter(t => t.id !== id);
    publish();
  };

  return (
    <div className="fixed top-20 right-4 z-[999] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border text-sm font-medium ${
              item.type === 'success'
                ? 'bg-white border-emerald-200 text-emerald-800'
                : 'bg-white border-red-200 text-red-700'
            }`}
          >
            {item.type === 'success'
              ? <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              : <XCircle     size={17} className="text-red-500 flex-shrink-0 mt-0.5" />
            }
            <span className="flex-1 leading-snug">{item.message}</span>
            <button
              onClick={() => dismiss(item.id)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
