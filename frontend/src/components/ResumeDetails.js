import React from "react";

export default function ResumeDetails({ data }) {
  if (!data) return null;
  const d = data;

  return (
    <div>
      <div className="card">
        <h3 style={{marginTop:0}}>{d.name || "Unnamed"}</h3>
        <div className="row">
          {d.email && <span className="badge">{d.email}</span>}
          {d.phone && <span className="badge">{d.phone}</span>}
          {d.linkedin_url && <a className="badge" href={d.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
          {d.portfolio_url && <a className="badge" href={d.portfolio_url} target="_blank" rel="noreferrer">Portfolio</a>}
          {typeof d.resume_rating === "number" && <span className="badge">Rating: {d.resume_rating}/10</span>}
        </div>
      </div>

      {d.summary && <div className="card"><h4>Summary</h4><p>{d.summary}</p></div>}

      <div className="card">
        <h4>Technical Skills</h4>
        <div className="chips">{(d.technical_skills||[]).map((s,i)=><span key={i} className="chip">{s}</span>)}</div>
        <h4 style={{marginTop:14}}>Soft Skills</h4>
        <div className="chips">{(d.soft_skills||[]).map((s,i)=><span key={i} className="chip">{s}</span>)}</div>
      </div>

      {(d.work_experience||[]).length>0 && (
        <div className="card">
          <h4>Experience</h4>
          {d.work_experience.map((w, i) => (
            <div key={i} style={{marginBottom:10}}>
              <strong>{w.role}</strong> — {w.company} {w.location?`(${w.location})`:""} <div style={{color:"#666"}}>{w.duration}</div>
              <ul>{(w.description||[]).map((b, j)=><li key={j}>{b}</li>)}</ul>
            </div>
          ))}
        </div>
      )}

      {(d.education||[]).length>0 && (
        <div className="card">
          <h4>Education</h4>
          {d.education.map((e,i)=>(
            <div key={i} style={{marginBottom:8}}>
              <strong>{e.degree}</strong> — {e.institution} {e.graduation_year?`(${e.graduation_year})`:""} {e.grade?` • ${e.grade}`:""}
            </div>
          ))}
        </div>
      )}

      {d.projects && d.projects.length>0 && (
        <div className="card">
          <h4>Projects</h4>
          {d.projects.map((p,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <strong>{p.title}</strong>{p.link?<> — <a href={p.link} target="_blank" rel="noreferrer">link</a></> : null}
              {p.description && <div>{p.description}</div>}
              {p.tech_stack && p.tech_stack.length>0 && (
                <div className="chips" style={{marginTop:6}}>{p.tech_stack.map((t,k)=><span key={k} className="chip">{t}</span>)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {d.improvement_areas && <div className="card"><h4>Improvement Areas</h4><p>{d.improvement_areas}</p></div>}

      {d.upskill_suggestions && d.upskill_suggestions.length>0 && (
        <div className="card">
          <h4>Upskill Suggestions</h4>
          <div className="chips">{d.upskill_suggestions.map((u,i)=><span key={i} className="chip">{u}</span>)}</div>
        </div>
      )}
    </div>
  );
}
