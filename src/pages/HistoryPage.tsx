import { FileText, Trash2, ChevronRight } from "lucide-react";
import ControlSidebar from "../components/ControlSidebar";
import MetricsSidebar from "../components/MetricsSidebar";
import { useWriter } from "../context/WriterContext";

export default function HistoryPage() {
  const { history, selectedHistoryId, loadHistoryItem, deleteHistoryItem } = useWriter();

  return (
    <div id="history-page-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <ControlSidebar />

      {/* History logs archive section */}
      <div className="flex-1 flex flex-col p-5 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 shrink-0">
          <h3 className="font-display text-sm font-semibold text-slate-800">Writing Histography Logs</h3>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed shrink-0">
            <strong>Managing your saved drafts:</strong> Select any previously generated document below to restore its full agent cascade state, settings, metrics, and editor copies inside the primary workspace.
          </div>

          {history.length === 0 ? (
            <div className="flex-1 bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <FileText className="h-10 w-10 text-slate-300 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-slate-800">Your history index is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">No drafts have been recorded into history yet. Run a prompt cascade first, and the outputs will be automatically cataloged.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {history.map((doc) => {
                const isSelected = selectedHistoryId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => loadHistoryItem(doc)}
                    id={`history-item-${doc.id}`}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition duration-150 flex items-start gap-4 shadow-sm hover:border-slate-300 ${
                      isSelected
                        ? "bg-slate-50 border-slate-800 ring-1 ring-slate-850"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="bg-slate-100 text-slate-600 p-2 rounded-xl mt-0.5 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-800 truncate text-sm">{doc.prompt}</h4>
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          Score: {doc.metrics.final.overallScore}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-medium">
                        <div className="flex gap-3">
                          <span>Timestamp: <strong>{doc.timestamp}</strong></span>
                          <span>Category: <strong className="capitalize">{doc.settings.category}</strong></span>
                          <span>Words: <strong>{doc.metrics.final.wordCount}</strong></span>
                        </div>

                        <span className="text-slate-400 flex items-center hover:text-slate-800 font-semibold">
                          Load Into Workspace <ChevronRight className="h-3 w-3 inline ml-0.5" />
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => deleteHistoryItem(doc.id, e)}
                      id={`delete-history-${doc.id}`}
                      className="text-slate-400 hover:text-rose-600 p-1.5 shrink-0 rounded-lg hover:bg-rose-50 transition cursor-pointer self-center"
                      title="Delete draft from archive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <MetricsSidebar />
    </div>
  );
}
