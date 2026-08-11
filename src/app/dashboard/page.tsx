"use client";

import { useEffect, useState } from "react";

type Candidate = {
  id?: string;
  name?: string;
  email?: string;
  status?: string;
  score?: number | string;
};

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporary dashboard shell.
    // Airtable data will be connected here next.
    setCandidates([]);
    setLoading(false);
  }, []);

  return (
    <main className="recruiter-page">
      <header className="recruiter-header">
        <div>
          <p className="recruiter-eyebrow">RECRUITMENT</p>
          <h1>Candidate Dashboard</h1>
          <p className="recruiter-subtitle">
            Review and manage submitted candidates.
          </p>
        </div>

        <a href="/" className="candidate-link">
          Candidate application →
        </a>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total candidates</span>
          <strong>{candidates.length}</strong>
        </div>

        <div className="stat-card">
          <span>Under review</span>
          <strong>
            {candidates.filter((c) => c.status === "Under Review").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Shortlisted</span>
          <strong>
            {candidates.filter((c) => c.status === "Shortlisted").length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Average ATS score</span>
          <strong>
            {candidates.length
              ? Math.round(
                  candidates.reduce(
                    (total, c) => total + Number(c.score || 0),
                    0
                  ) / candidates.length
                )
              : "—"}
          </strong>
        </div>
      </section>

      <section className="candidate-panel">
        <div className="panel-header">
          <div>
            <h2>Candidates</h2>
            <p>Applications received through the candidate portal.</p>
          </div>

          <button className="refresh-button" onClick={() => location.reload()}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p>Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◌</div>
            <h3>No candidates yet</h3>
            <p>
              Candidate submissions will appear here once they are received
              and processed.
            </p>
          </div>
        ) : (
          <div className="candidate-table">
            <div className="table-row table-heading">
              <span>Candidate</span>
              <span>Email</span>
              <span>Status</span>
              <span>ATS Score</span>
            </div>

            {candidates.map((candidate) => (
              <div className="table-row" key={candidate.id}>
                <span>{candidate.name || "—"}</span>
                <span>{candidate.email || "—"}</span>
                <span>{candidate.status || "Under Review"}</span>
                <span>{candidate.score ?? "—"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
