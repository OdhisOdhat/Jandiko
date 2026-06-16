import { BarChart3 } from "lucide-react";
import { useWriter } from "../context/WriterContext";

export default function MetricsSidebar() {
  const { liveMetrics } = useWriter();

  return (
    <section id="metrics-sidebar" className="w-full md:w-[35%] p-5 overflow-y-auto bg-white flex flex-col gap-6 shrink-0 border-l border-slate-200/80">
      
      {/* Circular Gauge Score Tracker */}
      <div className="text-center space-y-3 pb-5 border-b border-slate-100">
        <h3 className="text-xs font-bold font-display text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
          <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
          Human-Likeness Index
        </h3>

        <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="52"
              className="stroke-slate-100 fill-none"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="52"
              className={`fill-none transition-all duration-1000 ${
                liveMetrics.overallScore > 80 ? "stroke-emerald-600" :
                liveMetrics.overallScore > 50 ? "stroke-indigo-600" :
                "stroke-rose-600"
              }`}
              strokeWidth="8"
              strokeDasharray={326.7}
              strokeDashoffset={326.7 - (326.7 * liveMetrics.overallScore) / 100}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span id="metrics-gauge-score" className="text-3xl font-bold font-display tracking-tight text-slate-900">{liveMetrics.overallScore}%</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Human Score</span>
          </div>
        </div>

        <div className="bg-slate-50 px-3 py-2 rounded-xl text-[10px] text-slate-500 leading-relaxed">
          {liveMetrics.overallScore >= 80 && "✨ Exceptional structural variation. Pacing matches native human cadence."}
          {liveMetrics.overallScore >= 60 && liveMetrics.overallScore < 80 && "✔️ Solid flow. A few minor transition boilerplate words or pronouns remain."}
          {liveMetrics.overallScore < 60 && "⚠️ Typical uniform pacing. Sentences follow tight geometric length formulas."}
        </div>
      </div>

      {/* Visual Sentence Length Distribution Bar Chart */}
      <div className="space-y-3 border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
          <span>Pacing Cadence Visualizer</span>
          <span className="text-[10px] text-indigo-600 lowercase bg-indigo-50 px-1.5 py-0.5 rounded">burstiness metric</span>
        </div>
        <p className="text-[10px] text-slate-400">Jagged jags mean high variety (humanized). Flat/uniform plateaus denote typical robotic AI shapes.</p>

        {liveMetrics.sentenceLengths.length === 0 ? (
          <div className="border border-dashed border-slate-200 py-6 rounded-lg text-center text-xs text-slate-400">
            No layout dataset. Write or paste text to map pattern distributions here.
          </div>
        ) : (
          <div className="space-y-4">
            {/* SVG Custom Bar Chart */}
            <div className="h-28 bg-slate-50 rounded-xl px-3 py-3 border border-slate-100 flex items-end gap-1.5 overflow-x-auto">
              {liveMetrics.sentences.map((sent, idx) => {
                const maxWords = 45; // upper bound sizing
                const pct = Math.min((sent.length / maxWords) * 100, 100);
                const isShort = sent.length <= 8;
                const isLong = sent.length >= 22;

                return (
                  <div key={idx} className="flex-1 group flex flex-col items-center min-w-[7px] max-w-[20px] h-full justify-end relative">
                    <div 
                      style={{ height: `${pct}%` }} 
                      className={`w-full rounded-t-sm transition duration-300 ${
                        isShort ? "bg-cyan-500 hover:bg-cyan-600" :
                        isLong ? "bg-slate-800 hover:bg-slate-900" :
                        "bg-slate-400 hover:bg-slate-500"
                      }`}
                    />
                    
                    {/* Hover text popup */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 z-50 bg-slate-950 text-white text-[10px] px-2 py-1.5 rounded shadow-lg pointer-events-none transition duration-150 w-28 text-center leading-normal">
                      <p className="font-bold border-b border-slate-800 pb-0.5">Sentence #{idx+1}</p>
                      <p className="font-mono mt-0.5">{sent.length} words ({sent.burstinessType})</p>
                      <p className="text-[8px] text-slate-400 italic line-clamp-1 mt-0.5">"{sent.text}"</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[9px] text-slate-400 px-1 font-mono">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-cyan-500 rounded"></span> Punchy (≤8)</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-slate-400 rounded"></span> Medium (9-21)</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-slate-800 rounded"></span> Deep/Winding (≥22)</span>
            </div>
          </div>
        )}
      </div>

      {/* Scorecard checklist detail parameters */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold font-display text-slate-705 uppercase tracking-wider block">Detailed Metrics Diagnostics</h4>

        <div className="space-y-3.5">
          {/* Cadence Variance metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-bold">Sentence length variation</span>
              <span className="font-mono font-bold text-slate-900">{liveMetrics.burstinessScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full">
              <div style={{ width: `${liveMetrics.burstinessScore}%` }} className="h-full bg-slate-900 rounded-full" />
            </div>
          </div>

          {/* Openers Diversity */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-bold">Opening clause diversity</span>
              <span className="font-mono font-bold text-slate-950">{liveMetrics.openingDiversityScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full">
              <div style={{ width: `${liveMetrics.openingDiversityScore}%` }} className="h-full bg-slate-900 rounded-full" />
            </div>
          </div>

          {/* Transition cliché prevention */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-bold">Avoidance of cliché transitions</span>
              <span className="font-mono font-bold text-slate-950">{liveMetrics.transitionScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full">
              <div style={{ width: `${liveMetrics.transitionScore}%` }} className="h-full bg-slate-900 rounded-full" />
            </div>
          </div>

          {/* Skeptical Hedging */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-bold">Qualifying and Skeptical Hedging</span>
              <span className="font-mono font-bold text-slate-950">{liveMetrics.certaintyScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full">
              <div style={{ width: `${liveMetrics.certaintyScore}%` }} className="h-full bg-slate-900 rounded-full" />
            </div>
          </div>

          {/* Specific instance weight */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="font-bold">Empirical Factual Detail Index</span>
              <span className="font-mono font-bold text-slate-950">{liveMetrics.exampleQualityScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full">
              <div style={{ width: `${liveMetrics.exampleQualityScore}%` }} className="h-full bg-slate-900 rounded-full" />
            </div>
          </div>

          {/* Advanced Multi-Agent High-Fidelity Filters */}
          <div className="border-t border-slate-100 pt-4 mt-1 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">AI-Specific Style Filter Indicators</span>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/50 flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Grand Framing</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {liveMetrics.flaggedItems.filter(f => f.type === "grand_abstract").length} flagged
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${liveMetrics.flaggedItems.some(f => f.type === "grand_abstract") ? "bg-rose-500" : "bg-emerald-500"}`} />
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/50 flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Polished Analogies</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {liveMetrics.flaggedItems.filter(f => f.type === "polished_analogy").length} flagged
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${liveMetrics.flaggedItems.some(f => f.type === "polished_analogy") ? "bg-amber-500" : "bg-emerald-500"}`} />
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/50 flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Smooth Progression</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {liveMetrics.flaggedItems.filter(f => f.type === "smooth_progression").length} flagged
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${liveMetrics.flaggedItems.some(f => f.type === "smooth_progression") ? "bg-red-500" : "bg-emerald-500"}`} />
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/50 flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Dense Jargon Stack</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {liveMetrics.flaggedItems.filter(f => f.type === "dense_vocab").length} flagged
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${liveMetrics.flaggedItems.some(f => f.type === "dense_vocab") ? "bg-indigo-500" : "bg-emerald-500"}`} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
