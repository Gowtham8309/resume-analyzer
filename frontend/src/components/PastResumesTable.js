import React, { useEffect, useState } from "react";
import { listResumes, getResume } from "../api";
import ResumeDetails from "./ResumeDetails";

export default function PastResumesTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, limit: 20, offset: 0 });
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // { id, data }

  async function load(offset=0) {
    setBusy(true);
    try {
      const r = await listResumes({ limit: 20, offset, q });
      setRows(r.data);
      setMeta(r.meta);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(0); /* eslint-disable-next-line */ }, [q]);

  async function openDetails(id) {
    const r = await getResume(id);
    setModal({ id, data: r.data });
  }

  return (
    <div>
      <div className="card">
        <div className="row" style={{alignItems:"center"}}>
          <input className="input" placeholder="Search name/email/file…" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn" onClick={()=>load(0)}>Search</button>
        </div>
      </div>

      <table className="table">
        <thead><tr>
          <th>Uploaded</th><th>Name</th><th>Email</th><th>File</th><th>Rating</th><th></th>
        </tr></thead>
        <tbody>
          {busy ? (
            <tr><td colSpan="6"><div className="skeleton" style={{height:18}}/></td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan="6">No records yet.</td></tr>
          ) : rows.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.uploaded_at).toLocaleString()}</td>
              <td>{r.name || "—"}</td>
              <td>{r.email || "—"}</td>
              <td>{r.file_name}</td>
              <td>{typeof r.resume_rating==="number" ? r.resume_rating : "—"}</td>
              <td><button className="btn primary" onClick={()=>openDetails(r.id)}>Details</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop:10, display:"flex", gap:8}}>
        <button className="btn" disabled={meta.offset<=0} onClick={()=>load(Math.max(meta.offset-20,0))}>Prev</button>
        <button className="btn" disabled={meta.offset+20>=meta.total} onClick={()=>load(meta.offset+20)}>Next</button>
        <span className="badge">Showing {rows.length} / {meta.total}</span>
      </div>

      {modal && (
        <div className="modal" onClick={()=>setModal(null)}>
          <div className="sheet" onClick={(e)=>e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <h3 style={{margin:0}}>Resume #{modal.id}</h3>
              <button className="btn" onClick={()=>setModal(null)}>Close</button>
            </div>
            <ResumeDetails data={modal.data}/>
          </div>
        </div>
      )}
    </div>
  );
}
