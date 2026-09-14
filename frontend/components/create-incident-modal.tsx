"use client";

import { FormEvent, useState } from "react";
import { createIncident } from "@/lib/api";
import type { Incident } from "@/lib/types";
import { Modal, Button } from "./ui/primitives";

/**
 * Shared "Create incident" modal used by both the Dashboard and Incidents
 * sections. The caller decides what happens after creation (e.g. opening
 * the investigation workspace) via `onCreated`.
 */
export default function CreateIncidentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (incident: Incident) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const incident = await createIncident({
        title: title.trim(),
        description: description.trim(),
        severity,
      });
      onCreated(incident);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create incident");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      title="Create incident"
      description="Creating an incident immediately starts an AI investigation."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ci-title" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Title
          </label>
          <input
            id="ci-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Application latency spike"
            autoFocus
            disabled={submitting}
            className="form-field"
          />
        </div>
        <div>
          <label htmlFor="ci-description" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Description
          </label>
          <textarea
            id="ci-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the symptoms, affected service, and anything else the agent should know."
            rows={5}
            disabled={submitting}
            className="form-field resize-y"
          />
        </div>
        <div>
          <label htmlFor="ci-severity" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Severity
          </label>
          <select
            id="ci-severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            disabled={submitting}
            className="form-field"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">{error}</div>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} icon="plus">
            {submitting ? "Creating…" : "Create & investigate"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}