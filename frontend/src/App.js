import React, { useState } from "react";
import ResumeUploader from "./components/ResumeUploader";
import PastResumesTable from "./components/PastResumesTable";

export default function App() {
  const [tab, setTab] = useState("analysis");
  return (
    <div className="container">
      <h1>Resume Analyzer</h1>
      <div className="tabs">
        <button className={`tab ${tab==="analysis"?"active":""}`} onClick={() => setTab("analysis")}>Analysis</button>
        <button className={`tab ${tab==="history"?"active":""}`} onClick={() => setTab("history")}>History</button>
      </div>
      {tab === "analysis" ? <ResumeUploader/> : <PastResumesTable/>}
    </div>
  );
}
