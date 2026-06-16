import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { WriterProvider } from "./context/WriterContext";
import Header from "./components/Header";
import Toast from "./components/Toast";
import WorkspacePage from "./pages/WorkspacePage";
import ComparisonPage from "./pages/ComparisonPage";
import CritiquePage from "./pages/CritiquePage";
import ProfilesPage from "./pages/ProfilesPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <WriterProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
          {/* Toast Notification Alerts */}
          <Toast />

          {/* Core Layout Header navigation bar */}
          <Header />

          {/* Main Page Area managed by Routing */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route path="/" element={<WorkspacePage />} />
              <Route path="/compare" element={<ComparisonPage />} />
              <Route path="/critique" element={<CritiquePage />} />
              <Route path="/profiles" element={<ProfilesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WriterProvider>
  );
}
