import { useState } from "react";
import { Check, Copy, ShieldAlert, CheckCircle } from "lucide-react";
import { useWriter } from "../context/WriterContext";
import { FlaggedItem } from "../types";

export default function WorkspaceEditor() {
  const {
    activeTextSource,
    editedText,
    setEditedText,
    liveMetrics,
    selectedFlaggedItem,
    setSelectedFlaggedItem,
    handleSourceChange,
    handleApplyRepair,
    copyToClipboard,
    copied
  } = useWriter();

  return (
    <div id="workspace-editor-container" className="flex-1 flex flex-col p-5 overflow-y-auto">
      
      {/* Tab selection toolbar (Header-like quick actions) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 shrink-0">
        <h3 className="font-display text-sm font-semibold text-slate-800">Draft Editor</h3>

        <button
          disabled={!editedText}
          onClick={copyToClipboard}
          className="bg-white hover:border-slate-300 transition text-slate-600 border border-slate-200 p-2 rounded-lg flex items-center justify-center text-xs font-medium gap-1.5 cursor-pointer"
          title="Copy text to clipboard"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          <span>Copy Text</span>
        </button>
      </div>

      {/* Editor area wrapping panel */}
      <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
        
        {/* Stage selectors for active version display */}
        <div className="flex flex-wrap items-center gap-2 bg-white/70 border border-slate-200/80 p-1.5 rounded-lg text-xs justify-between shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Show Stage:</span>
            <button
              onClick={() => handleSourceChange("final")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTextSource === "final" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Final Master (Agent 6)
            </button>
            <button
              onClick={() => handleSourceChange("humanized")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTextSource === "humanized" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Humanized (Agent 4)
            </button>
            <button
              onClick={() => handleSourceChange("raw")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTextSource === "raw" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Raw Draft (Agent 3)
            </button>
            <button
              onClick={() => handleSourceChange("sources")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTextSource === "sources" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Citations Finder (Agent 2)
            </button>
            <button
              onClick={() => handleSourceChange("outline")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTextSource === "outline" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Outline Blueprint (Agent 1)
            </button>
          </div>
          <span className="text-[9px] text-slate-400 font-mono px-2">Live score: {liveMetrics.overallScore}%</span>
        </div>

        {/* Primary rich text area */}
        <div className="flex-1 relative flex flex-col min-h-0 bg-white border border-slate-200/80 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-slate-900/5">
          <textarea
            id="editor-textarea"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Generative drafts appear here once you launch the cascade. Or write/paste text here to diagnose its AI-likeness tells instantly."
            className="flex-1 w-full p-6 text-sm text-slate-800 bg-white rounded-2xl border-0 focus:ring-0 focus:outline-none font-sans leading-relaxed resize-none overflow-y-auto"
            style={{ minHeight: "250px" }}
          />

          {/* Words metadata footer overlay bar */}
          <div className="border-t border-slate-100 px-5 py-2.5 bg-slate-50/50 rounded-b-2xl flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex gap-4">
              <span>Words: <strong className="text-slate-800 font-semibold">{liveMetrics.wordCount}</strong></span>
              <span>Avg Sentence Length: <strong className="text-slate-800 font-semibold">{liveMetrics.averageSentenceLength} words</strong></span>
            </div>
            <span>Sentences: <strong className="text-slate-800 font-semibold">{liveMetrics.sentences.length}</strong></span>
          </div>
        </div>

        {/* Flagged elements and clichés repair dock */}
        <div className="space-y-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4 text-slate-600" />
            Interactive Repair Engine ({liveMetrics.flaggedItems.length} patterns discovered)
          </div>

          {liveMetrics.flaggedItems.length === 0 ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl flex items-center gap-2 text-xs text-slate-700">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Excellent! We detected no typical commercial AI buzzwords or structural clichés in your active draft.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {liveMetrics.flaggedItems.map((item, idx) => (
                <div 
                  key={idx}
                  role="button"
                  onClick={() => setSelectedFlaggedItem(selectedFlaggedItem?.id === item.id ? null : item)}
                  className={`p-3 rounded-xl border text-xs text-left transition flex items-start gap-2.5 cursor-pointer ${
                    selectedFlaggedItem?.id === item.id 
                      ? "bg-slate-900 border-slate-900 text-slate-205" 
                      : "bg-white border-slate-200 hover:border-slate-350 text-slate-700"
                  }`}
                >
                  <span className={`px-2 py-0.5 mt-0.5 text-[9px] rounded-md font-mono shrink-0 uppercase tracking-wide font-semibold ${
                    selectedFlaggedItem?.id === item.id 
                      ? "bg-slate-800 text-slate-300"
                      : item.type === "grand_abstract" ? "bg-rose-50 text-rose-700 border border-rose-150"
                      : item.type === "polished_analogy" ? "bg-amber-50 text-amber-700 border border-amber-150"
                      : item.type === "smooth_progression" ? "bg-red-50 text-red-700 border border-red-150"
                      : item.type === "dense_vocab" ? "bg-cyan-50 text-cyan-700 border border-cyan-150"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                  }`}>
                    {item.type.replace("_", " ")}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold ${selectedFlaggedItem?.id === item.id ? "text-white" : "text-slate-800"}`}>
                      {item.type === "grand_abstract" ? "Grand Abstract Framing: " :
                       item.type === "polished_analogy" ? "Polished Analogy: " :
                       item.type === "smooth_progression" ? "Overly Smooth Flow: " :
                       item.type === "dense_vocab" ? "Dense Jargon stack: " :
                       "Cliché Pattern: "}
                      <span className={`font-mono underline decoration-wavy decoration-2 px-1 ${selectedFlaggedItem?.id === item.id ? "text-rose-400 decoration-indigo-200" : "text-slate-900 decoration-indigo-400"}`}>"{item.phrase}"</span>
                    </p>
                    
                    {selectedFlaggedItem?.id === item.id && (
                      <div className="mt-2 space-y-2 border-t border-slate-850 pt-2 text-slate-300 text-[11px] leading-relaxed">
                        <p>{item.explanation}</p>
                        <div className="flex items-center gap-2 mt-1 justify-between flex-wrap">
                          <span>Suggested: <strong className="text-white font-mono bg-slate-800 px-1 rounded">{item.replacement}</strong></span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyRepair(item);
                            }}
                            className="bg-white text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded font-bold text-[10px]"
                          >
                            Auto Repair Target
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <PlusIcon rotate={selectedFlaggedItem?.id === item.id} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function PlusIcon({ className = "", rotate = false }) {
  return (
    <svg 
      className={`h-4 w-4 text-slate-400 transition-transform duration-205 shrink-0 mt-0.5 ${className} ${rotate ? "rotate-45" : ""}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
