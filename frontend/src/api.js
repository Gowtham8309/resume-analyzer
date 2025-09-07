import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 30000
});

export async function uploadResume(file) {
  const fd = new FormData();
  fd.append("resume", file);
  const { data } = await api.post("/resumes/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function listResumes({ limit=20, offset=0, q="" } = {}) {
  const { data } = await api.get("/resumes", { params: { limit, offset, q } });
  return data;
}

export async function getResume(id) {
  const { data } = await api.get(`/resumes/${id}`);
  return data;
}
