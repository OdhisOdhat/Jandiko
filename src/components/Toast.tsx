import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useWriter } from "../context/WriterContext";

export default function Toast() {
  const { notif } = useWriter();

  return (
    <AnimatePresence>
      {notif && (
        <motion.div
          id="toast-notification"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 backdrop-blur-md max-w-md ${
            notif.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800" :
            notif.type === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-800" :
            "bg-indigo-500/10 border-indigo-500/20 text-indigo-800"
          }`}
        >
          {notif.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-indigo-600" />
          )}
          <span className="text-sm font-medium">{notif.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
