import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from './use-toast';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.variant === 'destructive';
          const isSuccess = toast.variant === 'success';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-lg border backdrop-blur-md ${
                isError
                  ? 'bg-error/10 border-error/20 text-error'
                  : isSuccess
                  ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                  : 'glass-panel text-on-surface'
              }`}
            >
              <div className="flex gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {isError && <XCircle size={20} />}
                  {isSuccess && <CheckCircle2 size={20} />}
                  {!isError && !isSuccess && <AlertCircle size={20} />}
                </div>
                <div className="flex-1">
                  {toast.title && <h3 className="font-title-md font-semibold">{toast.title}</h3>}
                  {toast.description && <p className="text-label-md mt-1 opacity-90">{toast.description}</p>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
