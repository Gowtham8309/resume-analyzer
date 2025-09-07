# Resume Analyzer

A full-stack app to analyze PDF resumes, store structured results, and show AI-driven feedback.

## Stack
- **Frontend:** React (CRA)
- **Backend:** Node.js + Express
- **DB:** PostgreSQL
- **LLM:** Google Gemini via `@google/generative-ai`
- **PDF parsing:** `pdf-parse`

## Features
- Upload a PDF → extract text → prompt Gemini → **strict JSON** → validate → save → display.
- **Tab 1 – Analysis:** See the live analysis for the uploaded resume.
- **Tab 2 – History:** Browse previous uploads; open a **Details** modal that reuses the analysis view.

---

## 1. Prerequisites
- Node 18+ (Node 22 OK)
- PostgreSQL 14+ (service running)
- A **Google AI Studio** API key for Gemini

> Windows: the Postgres service is typically `postgresql-x64-17`. If `psql` isn’t in PATH, use the full path:  
> `& "C:\Program Files\PostgreSQL\17\bin\psql.exe" …`

---

## 2. Database setup

Create DB and table:

```bash
# Windows (PowerShell) example with full psql path
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h 127.0.0.1 -c "CREATE DATABASE resume_analyzer;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h 127.0.0.1 -d resume_analyzer -f ".\sql\create_table.sql"
