import ControlSidebar from "../components/ControlSidebar";
import WorkspaceEditor from "../components/WorkspaceEditor";
import MetricsSidebar from "../components/MetricsSidebar";

export default function WorkspacePage() {
  return (
    <div id="workspace-page-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Left sidebar container */}
      <ControlSidebar />
      
      {/* Center workspace area */}
      <WorkspaceEditor />
      
      {/* Right metrics sidebar */}
      <MetricsSidebar />
    </div>
  );
}
