import { Brain } from "lucide-react";
import Markdown from "react-markdown";
import ControlSidebar from "../components/ControlSidebar";
import MetricsSidebar from "../components/MetricsSidebar";
import { useWriter } from "../context/WriterContext";

export default function CritiquePage() {
  const { steps } = useWriter();
  const reviewerStep = steps.find((s) => s.step === "reviewer");

  return (
    <div id="critique-page-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <ControlSidebar />

      {/* Peer Review markdown visualizer */}
      <div className="flex-1 flex flex-col p-5 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 shrink-0">
          <h3 className="font-display text-sm font-semibold text-slate-800">Peer Critique</h3>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Brain className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Agent 5: Skeptical Peer Critique Report</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Automated deep reasoning report auditing validity, claims, and AI transition tells</p>
              </div>
            </div>

            {reviewerStep?.output ? (
              <div className="markdown-body text-xs text-slate-750 leading-relaxed prose prose-sm prose-indigo">
                <Markdown>{reviewerStep.output}</Markdown>
              </div>
            ) : (
              <div className="text-center py-16">
                <Brain className="h-10 w-10 text-slate-300 mx-auto animate-pulse mb-3" />
                <p className="text-xs text-slate-500 max-w-sm mx-auto">No critique report output available. Launch the cascade chain to run critical auditing.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MetricsSidebar />
    </div>
  );
}
