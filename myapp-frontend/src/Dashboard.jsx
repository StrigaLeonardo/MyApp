// Dashboard.jsx
import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import "./App.css";

const API_FILES = "/api/files";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const displayName = localStorage.getItem("displayName") || "user";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    fetch(API_FILES, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data) => setFiles(data))
      .catch((err) => console.error("Files load error", err));
  }, [token]);

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  async function handleUpload() {
    if (!selectedFile || !token) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch(API_FILES, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      const newFile = await res.json();
      setFiles((prev) => [...prev, newFile]);
      setSelectedFile(null);
    }
  }

  async function handleDownload(id, fileName) {
    if (!token) return;

    const res = await fetch(`${API_FILES}/${id}/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="dash-page">
      <div className="dash-card">
        <header className="dash-header">
          <h1 className="dash-title">Welcome, {displayName}</h1>
          <p className="dash-subtitle">
            Upload new files and see your existing files.
          </p>
        </header>

        <div className="dash-layout">
          <section className="dash-left">
            <div className="dash-panel">
              <h2 className="dash-section-title">Upload file</h2>
              <div className="dash-upload">
                <label className="dash-upload-label">
                  <span>Choose file</span>
                  <input type="file" onChange={handleFileChange} />
                </label>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className={`dash-button ${
                    !selectedFile ? "dash-button-disabled" : ""
                  }`}
                >
                  Upload
                </button>
              </div>

              {selectedFile && (
                <p className="dash-selected">Selected: {selectedFile.name}</p>
              )}

              <p className="dash-hint">
                Supported: PDFs, images and documents. Max 10 MB per file.
              </p>
            </div>
          </section>

          <section className="dash-right">
            <div className="dash-panel">
              <h2 className="dash-section-title">Your files</h2>
              {files.length === 0 ? (
                <p className="dash-empty">No files uploaded yet.</p>
              ) : (
                <ul className="dash-file-list">
                  {files.map((f) => (
                    <li key={f.id} className="dash-file-item">
                      <span className="dash-file-name">{f.fileName}</span>
                      <span className="dash-file-date">
                        {new Date(f.uploadedAt).toLocaleString()}
                      </span>
                      <button
                        className="dash-download-button"
                        onClick={() => handleDownload(f.id, f.fileName)}
                      >
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
