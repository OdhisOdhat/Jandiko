import { Sparkles } from "lucide-react";
import ControlSidebar from "../components/ControlSidebar";
import MetricsSidebar from "../components/MetricsSidebar";
import { useWriter } from "../context/WriterContext";

export default function ComparisonPage() {
  const { steps } = useWriter();

  const writerStep = steps.find((s) => s.step === "writer");
  const humanizedStep = steps.find((s) => s.step === "humanizer");

  return (
    <div id="comparison-page-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <ControlSidebar />

      {/* Comparison split panels */}
      <div className="flex-1 flex flex-col p-5 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 shrink-0">
          <h3 className="font-display text-sm font-semibold text-slate-800">Draft Comparison split</h3>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed shrink-0">
            <strong>How stylistic humanization operates:</strong> Compare drafts side-by-side. The left card shows standard AI writing metrics and flat structure baseline. The right displays processed humanized cadence with dynamic burstiness and precise contextual evidence.
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
            {/* Raw panel */}
            <div className="bg-white border border-slate-200/85 p-4 rounded-xl flex flex-col min-h-0 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3 shrink-1">
                <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-500">Stage 3: Raw AI Output</span>
                <span className="text-[10px] text-slate-400">Pacing: Standard plateau</span>
              </div>
              <div className="flex-1 overflow-y-auto text-xs text-slate-650 leading-relaxed max-h-[450px] whitespace-pre-wrap">
                {writerStep?.output ? (
                  writerStep.output
                ) : (
                  <p className="italic text-slate-400">Launch the Agent cascade to generate dynamic draft comparisons.</p>
                )}
              </div>
            </div>

            {/* Humanized panel */}
            <div className="bg-white border border-slate-800 p-4 rounded-xl flex flex-col min-h-0 shadow-sm ring-4 ring-slate-950/5">
              <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-3 shrink-1">
                <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-800 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  Stage 4: Humanized Draft
                </span>
                <span className="text-[10px] text-slate-500 underline underline-offset-2">Active Cadence</span>
              </div>
              <div className="flex-1 overflow-y-auto text-xs text-slate-850 leading-relaxed max-h-[450px] whitespace-pre-wrap">
                {humanizedStep?.output ? (
                  humanizedStep.output
                ) : (
                  <p className="italic text-slate-400">Active humanization draft output is shown once completed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MetricsSidebar />
    </div>
  );
}
