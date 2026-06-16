import { useRef, useEffect, useState } from "react";
import { 
  Layout, 
  Sliders, 
  Activity, 
  RefreshCw, 
  Layers, 
  CheckCircle, 
  Play, 
  Link2, 
  Globe, 
  Trash2, 
  AlertCircle, 
  Check, 
  FileText, 
  Plus, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { useWriter, PRESET_TOPICS } from "../context/WriterContext";

export default function ControlSidebar() {
  const {
    prompt,
    setPrompt,
    settings,
    updateSettings,
    pipelineRunning,
    currentStepIndex,
    steps,
    executePipeline,
    executeSingleStep,
    showToast,
    scrapedLinks,
    scrapeLink,
    deleteScrapedLink
  } = useWriter();

  const [linkInput, setLinkInput] = useState("");
  const [viewingLinkId, setViewingLinkId] = useState<string | null>(null);
  const [scrapingInProgress, setScrapingInProgress] = useState(false);

  const endOfProgressRef = useRef<HTMLDivElement>(null);

  // Auto-scroll stepper block into view when running
  useEffect(() => {
    if (pipelineRunning && endOfProgressRef.current) {
      endOfProgressRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [pipelineRunning, currentStepIndex]);

  return (
    <section id="control-sidebar" className="w-full lg:w-[32%] bg-white border-r border-slate-200/85 p-5 flex flex-col gap-6 overflow-y-auto shrink-0">
      {/* Topic/Prompt Selector */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Layout className="h-4 w-4 text-slate-500 animate-pulse" />
          1. Select Topic or Prompt
        </h2>
        
        <div className="grid grid-cols-1 gap-2.5">
          {PRESET_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              id={`preset-topic-${idx}`}
              onClick={() => {
                setPrompt(topic.prompt);
                showToast(`Loaded Template Profile: "${topic.title}"`, "info");
              }}
              className={`text-left p-3 rounded-xl border text-xs transition duration-200 hover:border-slate-300 cursor-pointer ${
                prompt === topic.prompt 
                  ? "border-slate-800 bg-slate-900/5 text-slate-900 shadow-sm font-medium" 
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <p className="font-semibold text-slate-800 line-clamp-1">{topic.title}</p>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">{topic.prompt}</p>
            </button>
          ))}
        </div>

        <textarea
          id="prompt_input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Or write custom instructions here... Be as specific or conceptual as you'd like."
          className="w-full h-32 p-3 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs transition placeholder:text-slate-400 font-sans leading-relaxed"
        />

        {/* Web Link Scraper Integration */}
        <div className="space-y-3 pt-3.5 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-slate-400" />
            Attach Reference Links (Scrape Context)
          </label>

          <div className="flex gap-2">
            <input
              type="url"
              id="link-scraper-input"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (linkInput.trim()) {
                    scrapeLink(linkInput.trim());
                    setLinkInput("");
                  }
                }
              }}
              placeholder="Paste any article, doc, or Wikipedia URL..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition font-sans placeholder:text-slate-400"
            />
            <button
              type="button"
              id="btn-add-scrape"
              onClick={() => {
                if (linkInput.trim()) {
                  scrapeLink(linkInput.trim());
                  setLinkInput("");
                } else {
                  showToast("Please enter a valid URL link.", "info");
                }
              }}
              className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition flex items-center justify-center shrink-0 shadow-sm"
              title="Add link and trigger server-side scraper"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* List of scraped link reference documents */}
          {scrapedLinks.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {scrapedLinks.map((link) => {
                const isScraping = link.status === "scraping";
                const isSuccess = link.status === "success";
                const isError = link.status === "error";

                return (
                  <div key={link.id} className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-200/55 transition flex flex-col gap-1.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0">
                          {isScraping && <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-500" />}
                          {isSuccess && <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />}
                          {isError && <AlertCircle className="h-3.5 w-3.5 text-rose-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-850 truncate leading-snug" title={link.title}>
                            {link.title}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono block truncate" title={link.url}>
                            {link.url}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSuccess && (
                          <button
                            type="button"
                            id={`btn-view-${link.id}`}
                            onClick={() => setViewingLinkId(viewingLinkId === link.id ? null : link.id)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 transition cursor-pointer"
                            title="Toggle scraped text snapshot"
                          >
                            {viewingLinkId === link.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                        <button
                          type="button"
                          id={`btn-delete-${link.id}`}
                          onClick={() => deleteScrapedLink(link.id)}
                          className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded text-slate-400 transition cursor-pointer"
                          title="Remove attached link"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Scraped text preview block */}
                    {isSuccess && viewingLinkId === link.id && (
                      <div className="mt-1 pb-1 pt-1.5 border-t border-slate-100 text-[10px] text-slate-600 max-h-36 overflow-y-auto leading-relaxed">
                        <div className="flex justify-between items-center bg-slate-100 px-2 py-0.5 rounded text-[9px] text-slate-500 font-medium mb-1.5">
                          <span>Scraped Payload ({link.charCount} chars)</span>
                          <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">Extracted Text</span>
                        </div>
                        <p className="whitespace-pre-line font-mono bg-white p-2 rounded border border-slate-100 text-[9px] text-slate-500">
                          {link.content}
                        </p>
                      </div>
                    )}

                    {isError && (
                      <p className="text-[10px] text-rose-600 bg-rose-50/70 p-2 rounded border border-rose-100 font-medium leading-relaxed">
                        {link.error || "Web crawler failed to read. Link may block automated requests."}
                      </p>
                    )}

                    {isScraping && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 animate-pulse bg-slate-100 p-2 rounded border border-slate-200/50">
                        <Globe className="h-3.5 w-3.5 animate-bounce shrink-0 text-slate-400" />
                        <span>Connecting to host, cleaning HTML layout tree & isolating text nodes...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic contextual notice */}
          {scrapedLinks.some(l => l.status === "success") && (
            <div className="text-[10px] bg-emerald-500/5 text-emerald-800 border border-emerald-500/15 rounded-lg p-2.5 flex items-center gap-1.5 font-medium leading-normal animate-fade-in">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 fill-emerald-100" />
              <span>Links attached. Sequential cascades will prioritize and site this scraped context.</span>
            </div>
          )}
        </div>
      </div>

      {/* Basic Style Quick Dials */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h2 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="h-4 w-4 text-slate-500" />
          2. Cascade Modifiers
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category Mode</label>
            <select
              id="sidebar-select-category"
              value={settings.category}
              onChange={(e) => updateSettings("category", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="academic">🏫 Academic Mode</option>
              <option value="research">🔬 Study Draft</option>
              <option value="blog">✍️ Editorial Blog</option>
              <option value="business">💼 Biz Proposal</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Formality</label>
            <select
              id="sidebar-select-formality"
              value={settings.formality}
              onChange={(e) => updateSettings("formality", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="casual">Casual</option>
              <option value="conversational">Conversational</option>
              <option value="professional">Professional</option>
              <option value="formal">Strict Formal</option>
            </select>
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Citation & Reference Style</label>
            <select
              id="sidebar-select-citation-style"
              value={settings.citationStyle}
              onChange={(e) => updateSettings("citationStyle", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg text-slate-700 focus:bg-white focus:outline-none cursor-pointer font-sans"
            >
              <option value="none">No formal citations (natural flow)</option>
              <option value="APA">APA Style (Author, Year)</option>
              <option value="MLA">MLA Formatting (Author, Page)</option>
              <option value="Harvard">Harvard Parenthetical System</option>
              <option value="Chicago">Chicago Footnotes & Bibliography</option>
              <option value="IEEE">IEEE Reference list numbers [1]</option>
              <option value="OSCOLA">OSCOLA (Oxford Legal Authorities)</option>
              <option value="Bluebook">Bluebook Legal Citation (Harvard)</option>
              <option value="AGLC">AGLC (Australian Legal Citation)</option>
            </select>
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Core Intelligence Engine</label>
            <select
              id="sidebar-select-model"
              value={settings.modelName || "gemini-3.5-flash"}
              onChange={(e) => updateSettings("modelName", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg text-slate-700 focus:bg-white focus:outline-none cursor-pointer font-sans"
            >
              <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash (Analytical & Creative)</option>
              <option value="gemini-3.1-flash-lite">🍃 Gemini 3.1 Flash Lite (High Rate Limits / Quota-Saver)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Humanization Depth</span>
              <span className="text-slate-800 font-mono">{settings.humanizationLevel}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.humanizationLevel}
              onChange={(e) => updateSettings("humanizationLevel", parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
            />
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Review Rigor</span>
              <span className="text-slate-800 font-mono">{settings.criticalThinkingLevel}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.criticalThinkingLevel}
              onChange={(e) => updateSettings("criticalThinkingLevel", parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Primary Generation Call to Action */}
      <div className="pt-2">
        <button
          id="btn-cascade-generate"
          onClick={executePipeline}
          disabled={pipelineRunning}
          className={`w-full py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition duration-200 ${
            pipelineRunning 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
              : "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 cursor-pointer shadow-slate-900/10"
          }`}
        >
          {pipelineRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
              Generating Chain ({currentStepIndex + 1}/6)...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4" />
              Draft & Humanize (6 Agents Cascade)
            </>
          )}
        </button>
      </div>

      {/* Stepped Indicators */}
      <div className="border-t border-slate-100 pt-5 space-y-4">
        <h3 className="text-sm font-bold font-display text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-slate-500" />
          Multi-Agent Chain Pipeline
        </h3>

        <div className="space-y-4 pl-1">
          {steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = step.status === "completed";
            const isFailed = step.status === "failed";

            return (
              <div key={idx} className="relative flex gap-3.5 group">
                {/* Stepper Helper vertical connection line */}
                {idx < steps.length - 1 && (
                  <div className={`absolute top-6 left-3.5 bottom-0 w-[1.5px] -translate-x-1/2 ${
                    isCompleted ? "bg-slate-900" : "bg-slate-200"
                  }`} />
                )}

                {/* Node Status Indicator Dot */}
                <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 z-10 transition duration-300 ${
                  isActive ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/10 scale-105" :
                  isCompleted ? "bg-white text-slate-950 border-slate-900" :
                  isFailed ? "bg-rose-50 text-rose-600 border-rose-200" :
                  "bg-white text-slate-400 border-slate-200"
                }`}>
                  {isActive ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-slate-955 fill-neutral-200" />
                  ) : (
                    <span className="text-[10px] font-mono font-bold mt-[1.5px]">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className={`text-xs font-bold ${
                      isActive ? "text-slate-900" :
                      isCompleted ? "text-slate-800" :
                      "text-slate-500"
                    }`}>{step.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCompleted && step.isOfflineFallback && (
                        <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1" title="Running in Quota-Resilient Offline Mode to bypass API limits.">
                          <span className="h-1 w-1 bg-amber-500 rounded-full animate-ping shrink-0" />
                          Offline
                        </span>
                      )}
                      {isCompleted && !step.isOfflineFallback && (
                        <span className="text-[9px] text-slate-500 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded font-medium">Done</span>
                      )}
                      {!pipelineRunning && (
                        <button
                          onClick={() => executeSingleStep(idx)}
                          className="text-[9px] flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 transition cursor-pointer border border-slate-200 shadow-sm font-semibold"
                          title={`Generate/Regenerate ${step.title} individually`}
                        >
                          <Play className="h-2 w-2" />
                          Run
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {step.step === "planner" && "Extracts blueprint structure & themes"}
                    {step.step === "sources" && "Grounds real papers, books, cases & cites"}
                    {step.step === "writer" && "Weaves citations into full detailed raw draft"}
                    {step.step === "humanizer" && "Applies burstiness & clears AI tells"}
                    {step.step === "reviewer" && "Simulates exhaustive critical peer critique"}
                    {step.step === "editor" && "Corrects anomalies into final masterpiece"}
                  </p>
                  
                  {isActive && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full animate-pulse w-[60%]" />
                      </div>
                      <span className="text-[9px] text-indigo-600 font-medium animate-pulse block">
                        {idx === 0 && "Parsing core semantic intent..."}
                        {idx === 1 && "Retrieving reputable publications & acts..."}
                        {idx === 2 && "Compiling and referencing drafts..."}
                        {idx === 3 && "Varying sentence shapes..."}
                        {idx === 4 && "Interrogating assumptions & accuracy..."}
                        {idx === 5 && "Resolving review critiques..."}
                      </span>
                    </div>
                  )}

                  {isFailed && (
                    <div className="mt-2 bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-[11px] text-rose-700 leading-normal">
                      <div className="font-bold flex items-center gap-1">
                        <span>⚠️ Execution Alert</span>
                      </div>
                      <p className="mt-1">
                        Model rate limit or overloading detected. Wait 30s and click <strong>"Run"</strong> above to retry, or try changing the <strong>Core Intelligence Engine</strong> to <em>Flash Lite</em> in settings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div ref={endOfProgressRef} />
      </div>
    </section>
  );
}
