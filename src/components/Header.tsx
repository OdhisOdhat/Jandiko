import { Link, useLocation } from "react-router-dom";
import { Sword, Layout, ListFilter, Activity, Brain, BookOpen } from "lucide-react";
import { useWriter } from "../context/WriterContext";

export default function Header() {
  const { resetWorkspace, history } = useWriter();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Editor", icon: Layout },
    { path: "/compare", label: "Comparison", icon: Activity },
    { path: "/critique", label: "Critique", icon: Brain },
    { path: "/profiles", label: "Settings & Profiles", icon: ListFilter },
    { path: "/history", label: "Histography", icon: BookOpen, count: history.length },
  ];

  return (
    <header id="app-header" className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Link to="/" className="bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-center shadow-sm">
          <Sword className="h-5 w-5 rotate-45 text-slate-100" />
        </Link>
        <div>
          <h1 className="text-lg font-bold font-display tracking-tight text-slate-900">Human-Like AI Writer</h1>
          <p className="text-xs text-slate-500 font-sans">Multi-Agent Generation & Stylistic Humanization Workspace</p>
        </div>
      </div>

      {/* Navigation Links for routes */}
      <nav className="flex items-center bg-slate-50 border border-slate-200/80 p-1.5 rounded-xl gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              id={`nav-link-${item.path.slice(1) || 'home'}`}
              className={`flex items-center gap-1.5 px-3 py-2 font-display text-xs font-semibold rounded-lg transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/40"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-600 shadow-inner">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Engine: gemini-3.5-flash
        </div>
        <button 
          id="btn-reset-workspace"
          onClick={resetWorkspace}
          className="text-xs bg-white text-slate-500 font-medium px-3 py-2 border border-slate-200 rounded-lg hover:border-slate-300 transition duration-200 cursor-pointer"
        >
          Reset
        </button>
      </div>
    </header>
  );
}
