import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { WritingMetrics, WritingSettings, AgentStepResult, DocumentVersion, FlaggedItem } from "../types";
import { analyzeText } from "../lib/metrics";

export const PRESET_TOPICS = [
  {
    title: "Hydrothermal Deep Sea Ecosystems",
    prompt: "An academic advisory paper on hydrothermal vent ecosystems in international waters, arguing why mineral harvesting regulations must adapt to safeguard yet-undiscovered chemo-synthetic lifeforms."
  },
  {
    title: "Generative Apps & Memory Degradation",
    prompt: "A research study on the cognitive implications of continuous reliance on conversational agents, specifically analyzing the degradation of human prospective memory pathing."
  },
  {
    title: "Aesthetics of gentrified coffee spaces",
    prompt: "A cultural essay criticizing how third-wave coffee roasters and minimal fast-casual setups enforce aesthetic gentrification, standardizing civic interactions into commercial transactions."
  }
];

export const DEFAULT_SETTINGS: WritingSettings = {
  category: "academic",
  formality: "professional",
  humanizationLevel: 75,
  criticalThinkingLevel: 75,
  hedgingStyle: "balanced",
  examplesWeight: "balanced",
  citationStyle: "APA",
  modelName: "gemini-3.5-flash"
};

interface WriterContextType {
  prompt: string;
  setPrompt: (pt: string) => void;
  settings: WritingSettings;
  setSettings: React.Dispatch<React.SetStateAction<WritingSettings>>;
  pipelineRunning: boolean;
  currentStepIndex: number;
  steps: AgentStepResult[];
  activeTab: "workspace" | "compare" | "critique";
  setActiveTab: (tab: "workspace" | "compare" | "critique") => void;
  activeTextSource: "final" | "humanized" | "raw" | "sources" | "outline";
  setActiveTextSource: (src: "final" | "humanized" | "raw" | "sources" | "outline") => void;
  editedText: string;
  setEditedText: (txt: string) => void;
  selectedFlaggedItem: FlaggedItem | null;
  setSelectedFlaggedItem: (item: FlaggedItem | null) => void;
  notif: { text: string; type: "success" | "error" | "info" } | null;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
  copied: boolean;
  copyToClipboard: () => void;
  history: DocumentVersion[];
  savedProfiles: { name: string; settings: WritingSettings }[];
  newProfileName: string;
  setNewProfileName: (name: string) => void;
  selectedHistoryId: string | null;
  liveMetrics: WritingMetrics;
  rawDraftBaseline: WritingMetrics | null;
  updateSettings: (key: keyof WritingSettings, val: any) => void;
  saveProfile: () => void;
  loadProfile: (prof: WritingSettings) => void;
  deleteProfile: (name: string) => void;
  executePipeline: () => Promise<void>;
  executeSingleStep: (stepIndex: number) => Promise<void>;
  loadHistoryItem: (doc: DocumentVersion) => void;
  deleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  handleSourceChange: (src: "final" | "humanized" | "raw" | "sources" | "outline") => void;
  handleApplyRepair: (item: FlaggedItem) => void;
  resetWorkspace: () => void;
}

const WriterContext = createContext<WriterContextType | undefined>(undefined);

export function WriterProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState(PRESET_TOPICS[0].prompt);
  const [settings, setSettings] = useState<WritingSettings>(() => {
    const saved = localStorage.getItem("writer_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [steps, setSteps] = useState<AgentStepResult[]>([
    { step: "planner", title: "Agent 1: Research Planner", status: "idle", output: "", timestamp: "" },
    { step: "sources", title: "Agent 2: Literary Search Agent", status: "idle", output: "", timestamp: "" },
    { step: "writer", title: "Agent 3: Draft Writer", status: "idle", output: "", timestamp: "" },
    { step: "humanizer", title: "Agent 4: Humanization Editor", status: "idle", output: "", timestamp: "" },
    { step: "reviewer", title: "Agent 5: Critical Reviewer", status: "idle", output: "", timestamp: "" },
    { step: "editor", title: "Agent 6: Final Editor", status: "idle", output: "", timestamp: "" }
  ]);

  const [activeTab, setActiveTab] = useState<"workspace" | "compare" | "critique">("workspace");
  const [activeTextSource, setActiveTextSource] = useState<"final" | "humanized" | "raw" | "sources" | "outline">("final");
  const [editedText, setEditedText] = useState("");
  const [selectedFlaggedItem, setSelectedFlaggedItem] = useState<FlaggedItem | null>(null);

  const [notif, setNotif] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [copied, setCopied] = useState(false);

  const [history, setHistory] = useState<DocumentVersion[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<{ name: string; settings: WritingSettings }[]>([]);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [rawDraftBaseline, setRawDraftBaseline] = useState<WritingMetrics | null>(null);

  const liveMetrics = useMemo<WritingMetrics>(() => {
    return analyzeText(editedText);
  }, [editedText]);

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    setNotif({ text, type });
    setTimeout(() => setNotif(null), 4000);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("writer_history");
    const savedProfilesList = localStorage.getItem("writer_profiles");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedProfilesList) {
      setSavedProfiles(JSON.parse(savedProfilesList));
    } else {
      const standard = [
        { name: "Skeptical Academic", settings: { ...DEFAULT_SETTINGS, category: "academic" as const, criticalThinkingLevel: 95, hedgingStyle: "pronounced" as const } },
        { name: "Lively Business Reporter", settings: { ...DEFAULT_SETTINGS, category: "business" as const, formality: "conversational" as const, humanizationLevel: 90, examplesWeight: "anecdotal" as const } }
      ];
      setSavedProfiles(standard);
      localStorage.setItem("writer_profiles", JSON.stringify(standard));
    }
  }, []);

  const updateSettings = (key: keyof WritingSettings, val: any) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    localStorage.setItem("writer_settings", JSON.stringify(next));
  };

  const saveProfile = () => {
    if (!newProfileName.trim()) {
      showToast("Please enter a name for the profile", "error");
      return;
    }
    const next = [...savedProfiles, { name: newProfileName.trim(), settings }];
    setSavedProfiles(next);
    localStorage.setItem("writer_profiles", JSON.stringify(next));
    setNewProfileName("");
    showToast(`Saved profile: "${newProfileName.trim()}"`, "success");
  };

  const loadProfile = (prof: WritingSettings) => {
    setSettings(prof);
    localStorage.setItem("writer_settings", JSON.stringify(prof));
    showToast("Profile loaded successfully", "success");
  };

  const deleteProfile = (name: string) => {
    const next = savedProfiles.filter(p => p.name !== name);
    setSavedProfiles(next);
    localStorage.setItem("writer_profiles", JSON.stringify(next));
    showToast("Profile removed", "info");
  };

  const executePipeline = async () => {
    if (!prompt.trim()) {
      showToast("Please enter a writing prompt or select a preset.", "error");
      return;
    }

    setPipelineRunning(true);
    setCurrentStepIndex(0);
    setActiveTab("workspace");
    
    const refreshedSteps = steps.map(s => ({
      ...s,
      status: "idle" as const,
      output: "",
      timestamp: ""
    }));
    setSteps(refreshedSteps);

    const currentOutputs = {
      outline: "",
      sources: "",
      rawDraft: "",
      humanizedDraft: "",
      critique: "",
      finalVersion: ""
    };

    const runTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    for (let i = 0; i < steps.length; i++) {
      const activeStep = steps[i].step;
      setCurrentStepIndex(i);
      
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "running" as const } : s));

      if (i > 0) {
        // Safe delay buffer to satisfy API rate limits under high demand or sequential cascade requests
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      try {
        const response = await fetch("/api/generate-step", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: activeStep,
            prompt,
            settings,
            previousOutputs: currentOutputs
          })
        });

        if (!response.ok) {
          let errMsg = `HTTP error! Status: ${response.status}`;
          try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errData = await response.json();
              errMsg = errData.error || errMsg;
            } else {
              const textSnip = await response.text();
              errMsg = textSnip.substring(0, 150).trim() || errMsg;
            }
          } catch (e) {
            // ignore fallback error
          }
          throw new Error(errMsg);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textSnip = await response.text();
          throw new Error(`Server returned non-JSON response (${response.status}). Snippet: "${textSnip.substring(0, 150).trim()}"`);
        }

        const data = await response.json();
        const output = data.output;

        if (activeStep === "planner") currentOutputs.outline = output;
        else if (activeStep === "sources") currentOutputs.sources = output;
        else if (activeStep === "writer") currentOutputs.rawDraft = output;
        else if (activeStep === "humanizer") currentOutputs.humanizedDraft = output;
        else if (activeStep === "reviewer") currentOutputs.critique = output;
        else if (activeStep === "editor") currentOutputs.finalVersion = output;

        setSteps(prev => prev.map((s, idx) => idx === i ? {
          ...s,
          status: "completed" as const,
          output,
          timestamp: runTimestamp
        } : s));

        if (activeStep === "writer") {
          const rawMetricsResult = analyzeText(output);
          setRawDraftBaseline(rawMetricsResult);
        }

      } catch (err: any) {
        console.error(`Error in step ${activeStep}:`, err);
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "failed" as const } : s));
        showToast(`Pipeline failed at [${steps[i].title}]: ${err.message}`, "error");
        setPipelineRunning(false);
        return;
      }
    }

    setPipelineRunning(false);
    setCurrentStepIndex(-1);

    setEditedText(currentOutputs.finalVersion);
    setActiveTextSource("final");
    showToast("Multi-Agent Writing Chain completed successfully!", "success");

    const finalMetrics = analyzeText(currentOutputs.finalVersion);
    const rawMetrics = rawDraftBaseline || analyzeText(currentOutputs.rawDraft);

    const newDocVersion: DocumentVersion = {
      id: "doc_" + Date.now(),
      timestamp: new Date().toLocaleString(),
      prompt,
      settings,
      outputs: currentOutputs,
      metrics: {
        raw: rawMetrics,
        final: finalMetrics
      }
    };

    const nextHistory = [newDocVersion, ...history];
    setHistory(nextHistory);
    localStorage.setItem("writer_history", JSON.stringify(nextHistory));
    setSelectedHistoryId(newDocVersion.id);
  };

  const executeSingleStep = async (stepIndex: number) => {
    if (!prompt.trim()) {
      showToast("Please enter a writing prompt.", "error");
      return;
    }
    if (pipelineRunning) {
      showToast("Another generation task is currently running.", "error");
      return;
    }

    setPipelineRunning(true);
    setCurrentStepIndex(stepIndex);

    const currentOutputs = {
      outline: steps.find(s => s.step === "planner")?.output || "",
      sources: steps.find(s => s.step === "sources")?.output || "",
      rawDraft: steps.find(s => s.step === "writer")?.output || "",
      humanizedDraft: steps.find(s => s.step === "humanizer")?.output || "",
      critique: steps.find(s => s.step === "reviewer")?.output || "",
      finalVersion: steps.find(s => s.step === "editor")?.output || ""
    };

    const targetStep = steps[stepIndex];
    const activeStep = targetStep.step;

    setSteps(prev => prev.map((s, idx) => idx === stepIndex ? { ...s, status: "running" as const } : s));
    const runTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const response = await fetch("/api/generate-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: activeStep,
          prompt,
          settings,
          previousOutputs: currentOutputs
        })
      });

      if (!response.ok) {
        let errMsg = `HTTP error! Status: ${response.status}`;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            errMsg = errData.error || errMsg;
          } else {
            const textSnip = await response.text();
            errMsg = textSnip.substring(0, 150).trim() || errMsg;
          }
        } catch (e) {
          // ignore fallback error
        }
        throw new Error(errMsg);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textSnip = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}). Snippet: "${textSnip.substring(0, 150).trim()}"`);
      }

      const data = await response.json();
      const output = data.output;

      if (activeStep === "planner") currentOutputs.outline = output;
      else if (activeStep === "sources") currentOutputs.sources = output;
      else if (activeStep === "writer") currentOutputs.rawDraft = output;
      else if (activeStep === "humanizer") currentOutputs.humanizedDraft = output;
      else if (activeStep === "reviewer") currentOutputs.critique = output;
      else if (activeStep === "editor") {
        currentOutputs.finalVersion = output;
        setEditedText(output);
        setActiveTextSource("final");
      }

      setSteps(prev => prev.map((s, idx) => idx === stepIndex ? {
        ...s,
        status: "completed" as const,
        output,
        timestamp: runTimestamp
      } : s));

      if (activeStep === "writer") {
        const rawMetricsResult = analyzeText(output);
        setRawDraftBaseline(rawMetricsResult);
      }

      showToast(`${targetStep.title} generated successfully.`, "success");

      if (activeStep === "editor") {
        setActiveTab("workspace");
      } else if (activeStep === "reviewer") {
        setActiveTab("critique");
      }

    } catch (err: any) {
      console.error(`Error in individual step ${activeStep}:`, err);
      setSteps(prev => prev.map((s, idx) => idx === stepIndex ? { ...s, status: "failed" as const } : s));
      showToast(`Step failed [${targetStep.title}]: ${err.message}`, "error");
    } finally {
      setPipelineRunning(false);
      setCurrentStepIndex(-1);
    }
  };

  const loadHistoryItem = (doc: DocumentVersion) => {
    setPrompt(doc.prompt);
    setSettings(doc.settings);
    
    setSteps(prev => prev.map(s => {
      let outputVal = "";
      if (s.step === "planner") outputVal = doc.outputs.outline;
      else if (s.step === "sources") outputVal = doc.outputs.sources;
      else if (s.step === "writer") outputVal = doc.outputs.rawDraft;
      else if (s.step === "humanizer") outputVal = doc.outputs.humanizedDraft;
      else if (s.step === "reviewer") outputVal = doc.outputs.critique;
      else if (s.step === "editor") outputVal = doc.outputs.finalVersion;
      
      return {
        ...s,
        status: "completed" as const,
        output: outputVal,
        timestamp: "Historical"
      };
    }));

    setRawDraftBaseline(doc.metrics.raw);
    setEditedText(doc.outputs.finalVersion);
    setActiveTextSource("final");
    setSelectedHistoryId(doc.id);
    showToast("Historical document restored into workspace.", "success");
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = history.filter(h => h.id !== id);
    setHistory(next);
    localStorage.setItem("writer_history", JSON.stringify(next));
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
    }
    showToast("Document removed from history.", "info");
  };

  const handleSourceChange = (src: "final" | "humanized" | "raw" | "sources" | "outline") => {
    setActiveTextSource(src);
    const targetStep = steps.find(s => 
      src === "final" ? s.step === "editor" :
      src === "humanized" ? s.step === "humanizer" :
      src === "raw" ? s.step === "writer" :
      src === "sources" ? s.step === "sources" :
      s.step === "planner"
    );
    if (targetStep && targetStep.output) {
      setEditedText(targetStep.output);
    } else {
      setEditedText("");
      showToast(`No output available for the "${src}" agent stage.`, "info");
    }
  };

  const handleApplyRepair = (item: FlaggedItem) => {
    const startIdx = editedText.toLowerCase().indexOf(item.phrase.toLowerCase());
    if (startIdx === -1) {
      showToast("Matching phrase not found in editor text. It may have been edited.", "error");
      return;
    }
    
    const before = editedText.substring(0, startIdx);
    const after = editedText.substring(startIdx + item.phrase.length);
    const repaired = before + item.replacement + after;
    
    setEditedText(repaired);
    setSelectedFlaggedItem(null);
    showToast(`Replaced cliché "${item.phrase}" with "${item.replacement}"`, "success");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Copied content to clipboard", "success");
  };

  const resetWorkspace = () => {
    setPrompt(PRESET_TOPICS[0].prompt);
    setSettings(DEFAULT_SETTINGS);
    setEditedText("");
    setRawDraftBaseline(null);
    setSteps(prev => prev.map(s => ({ ...s, status: "idle", output: "" })));
    showToast("Workspace settings reset to default", "info");
  };

  return (
    <WriterContext.Provider
      value={{
        prompt,
        setPrompt,
        settings,
        setSettings,
        pipelineRunning,
        currentStepIndex,
        steps,
        activeTab,
        setActiveTab,
        activeTextSource,
        setActiveTextSource,
        editedText,
        setEditedText,
        selectedFlaggedItem,
        setSelectedFlaggedItem,
        notif,
        showToast,
        copied,
        copyToClipboard,
        history,
        savedProfiles,
        newProfileName,
        setNewProfileName,
        selectedHistoryId,
        liveMetrics,
        rawDraftBaseline,
        updateSettings,
        saveProfile,
        loadProfile,
        deleteProfile,
        executePipeline,
        loadHistoryItem,
        deleteHistoryItem,
        handleSourceChange,
        handleApplyRepair,
        executeSingleStep,
        resetWorkspace
      }}
    >
      {children}
    </WriterContext.Provider>
  );
}

export function useWriter() {
  const context = useContext(WriterContext);
  if (context === undefined) {
    throw new Error("useWriter must be used within a WriterProvider");
  }
  return context;
}
