import React, { useState } from "react";
import { uploadResume } from "../api";
import ResumeDetails from "./ResumeDetails";

export default function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function onUpload() {
    setError("");
    setResult(null);
    if (!file) return setError("Please choose a PDF first.");
    if (file.type !== "application/pdf") return setError("Only PDF is accepted.");
    if (file.size > 10 * 1024 * 1024) return setError("PDF must be ≤ 10 MB.");

    setBusy(true);
    try {
      const resp = await uploadResume(file);
      setResult(resp.data);
    } catch (e) {
      const msg = e?.response?.data?.error?.message || e.message || "Upload failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="card">
        <h3 style={{marginTop:0}}>Upload Resume (PDF)</h3>
        <input className="input" type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
        <div style={{marginTop:10, display:"flex", gap:8}}>
          <button className={`btn ${busy?"":"primary"}`} disabled={busy} onClick={onUpload}>
            {busy ? "Analyzing..." : "Analyze"}
          </button>
          {error && <div className="badge" style={{background:"#fee2e2", borderColor:"#fca5a5", color:"#991b1b"}}>{error}</div>}
        </div>
      </div>

      {!result && busy && (
        <div className="card">
          <div className="skeleton" style={{width:"50%", height:16, marginBottom:8}}></div>
          <div className="skeleton" style={{width:"80%", height:12}}></div>
        </div>
      )}

      {result && <ResumeDetails data={result} />}
    </div>
  );
}
