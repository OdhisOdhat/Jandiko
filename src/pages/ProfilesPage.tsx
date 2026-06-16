import { Sliders, ListFilter } from "lucide-react";
import ControlSidebar from "../components/ControlSidebar";
import MetricsSidebar from "../components/MetricsSidebar";
import { useWriter } from "../context/WriterContext";

export default function ProfilesPage() {
  const {
    settings,
    updateSettings,
    savedProfiles,
    saveProfile,
    loadProfile,
    deleteProfile,
    newProfileName,
    setNewProfileName
  } = useWriter();

  return (
    <div id="profiles-page-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <ControlSidebar />

      {/* Stylistic Customizers & Saved Presets Grid */}
      <div className="flex-1 flex flex-col p-5 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 shrink-0">
          <h3 className="font-display text-sm font-semibold text-slate-800">Advanced Modifier Profiles</h3>
        </div>

        <div className="flex-1 flex flex-col gap-6 min-h-[400px]">
          {/* Main settings form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-slate-700" />
              Stylistic Coefficients & Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block">Document Category Mode</label>
                <select
                  value={settings.category}
                  onChange={(e) => updateSettings("category", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 focus:bg-white focus:outline-none"
                >
                  <option value="academic">🏫 Academic Paper</option>
                  <option value="research">🔬 Research Study</option>
                  <option value="blog">✍️ Editorial Blog</option>
                  <option value="business">💼 Business Proposal</option>
                </select>
                <p className="text-[10px] text-slate-400">Instructs agents to output text following category layouts.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block">Document Formality</label>
                <select
                  value={settings.formality}
                  onChange={(e) => updateSettings("formality", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 focus:bg-white focus:outline-none"
                >
                  <option value="casual">Casual</option>
                  <option value="conversational">Conversational</option>
                  <option value="professional">Professional</option>
                  <option value="formal">Strict Formal</option>
                </select>
                <p className="text-[10px] text-slate-400">Controls grammatical stiffness coefficients.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block">Skeptical Hedging Style</label>
                <select
                  value={settings.hedgingStyle}
                  onChange={(e) => updateSettings("hedgingStyle", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 focus:bg-white focus:outline-none"
                >
                  <option value="minimal">Minimal (Flat Claims)</option>
                  <option value="balanced">Balanced Human (Reasonable qualifiers)</option>
                  <option value="pronounced">Pronounced (Highly cautious Academic)</option>
                </select>
                <p className="text-[10px] text-slate-400">Dials insertion of qualified caveats like 'arguably' or 'suggests'.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block">Evidence Instance Selection</label>
                <select
                  value={settings.examplesWeight}
                  onChange={(e) => updateSettings("examplesWeight", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 focus:bg-white focus:outline-none"
                >
                  <option value="theoretical">Abstract Theory</option>
                  <option value="balanced">Balanced Mixture</option>
                  <option value="anecdotal">Anecdotal (Context-bound examples)</option>
                  <option value="empirical">Empirical Study (Specific statistics)</option>
                </select>
                <p className="text-[10px] text-slate-400">Vetoes general placeholders in favor of concrete historical details.</p>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-widest block">Citations Style formatting</label>
                <select
                  value={settings.citationStyle}
                  onChange={(e) => updateSettings("citationStyle", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-700 focus:bg-white focus:outline-none font-sans"
                >
                  <option value="none">No formal citations (natural human flow)</option>
                  <option value="APA">APA Guidelines (Author, Year)</option>
                  <option value="MLA">MLA Formatting (Author, Page)</option>
                  <option value="Harvard">Harvard System (Author Year, Page)</option>
                  <option value="Chicago">Chicago Footnotes & Bibliography Style</option>
                  <option value="IEEE">IEEE Reference list numbers [1]</option>
                  <option value="OSCOLA">OSCOLA (Oxford Standard for Legal Authorities)</option>
                  <option value="Bluebook">Bluebook Legal Citation (Harvard Law Review Code)</option>
                  <option value="AGLC">AGLC (Australian Guide to Legal Citation)</option>
                </select>
                <p className="text-[10px] text-slate-400">Controls parenthetical citation and footnote references inside the multi-agent drafts.</p>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-widest">
                  <span>Stylistic Humanization Level</span>
                  <span className="text-slate-800 font-mono text-sm">{settings.humanizationLevel}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={settings.humanizationLevel}
                  onChange={(e) => updateSettings("humanizationLevel", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
                <p className="text-[10px] text-slate-400 leading-normal">Higher settings trigger aggressive sentence length variation (the core metric to destroy robotic uniform flow) and synonym maps.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-widest">
                  <span>Critical Peer Review Rigor</span>
                  <span className="text-slate-800 font-mono text-sm">{settings.criticalThinkingLevel}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={settings.criticalThinkingLevel}
                  onChange={(e) => updateSettings("criticalThinkingLevel", parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
                <p className="text-[10px] text-slate-400 leading-normal">Controls how detailed, demanding, and thorough Agent 4's Skeptical Critique report will behave.</p>
              </div>
            </div>
          </div>

          {/* Profile save list panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-slate-700" />
              Save or Load Style Presets
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Name and freeze your active stylistic variables (category, hedging, flow densities, cite styling). Saving profile keys allows instantaneous layout loads for your customized projects.
            </p>

            <div className="flex gap-2 max-w-md">
              <input
                id="profiles-input-new-name"
                type="text"
                placeholder="Custom Preset (e.g., Casual Editorial)"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="flex-1 bg-white border border-slate-200 px-3 py-2 text-xs rounded-xl focus:outline-none"
              />
              <button
                id="btn-profiles-save-new"
                onClick={saveProfile}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition cursor-pointer shrink-0"
              >
                Save Profile
              </button>
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">My Saved Profiles</label>
              {savedProfiles.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No saved presets yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {savedProfiles.map((prof, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-none flex justify-between items-start"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-850 truncate">{prof.name}</p>
                        <p className="text-[9px] text-slate-400 capitalize mt-0.5">
                          {prof.settings.category} | {prof.settings.formality}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => loadProfile(prof.settings)}
                          className="text-[10px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteProfile(prof.name)}
                          className="text-slate-400 hover:text-rose-600 text-sm font-semibold p-1 leading-none cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MetricsSidebar />
    </div>
  );
}
