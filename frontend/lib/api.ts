import type {
  ApiError,
  AppHealth,
  CreateIncidentRequest,
  Incident,
  InvestigationResponse,
  ToolsHealth,
  ToolsLogs,
  ToolsMetrics,
  UpdateIncidentRequest,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Central request helper. Parses FastAPI error bodies (which use
 * `detail`) and raises a readable `Error`.
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as
        | ApiError
        | { detail?: Array<{ msg?: string }> };

      if (Array.isArray((body as { detail?: unknown }).detail)) {
        // FastAPI validation errors surface as a `detail` array.
        const messages = (body as { detail: Array<{ msg?: string }> })
          .detail.map((item) => item.msg)
          .filter(Boolean);
        if (messages.length > 0) {
          errorMessage = messages.join("; ");
        }
      } else if (
        typeof (body as ApiError).detail === "string"
      ) {
        errorMessage = (body as ApiError).detail as string;
      } else if (typeof (body as ApiError).message === "string") {
        errorMessage = (body as ApiError).message as string;
      }
    } catch {
      // Keep the default message when the body is not JSON.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/*
 * Every backend path lives here so endpoint strings are not spread
 * across components. Must match `backend/app/api/v1` routes.
 */
export const API_ROUTES = {
  appHealth: "/health",
  appHealthDb: "/health/db",

  incidents: "/api/v1/incidents",
  agentInvestigate: "/api/v1/agent/investigate",

  toolsHealth: "/api/v1/tools/health",
  toolsMetrics: "/api/v1/tools/metrics",
  toolsLogs: "/api/v1/tools/logs",
} as const;

/* ------------------------------------------------------------------ */
/* Incidents                                                           */
/* ------------------------------------------------------------------ */

export async function getIncidents(): Promise<Incident[]> {
  return request<Incident[]>(API_ROUTES.incidents);
}

export async function getIncident(id: string): Promise<Incident> {
  return request<Incident>(`${API_ROUTES.incidents}/${id}`);
}

export async function createIncident(
  payload: CreateIncidentRequest,
): Promise<Incident> {
  return request<Incident>(API_ROUTES.incidents, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateIncident(
  id: string,
  payload: UpdateIncidentRequest,
): Promise<Incident> {
  return request<Incident>(`${API_ROUTES.incidents}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteIncident(id: string): Promise<void> {
  return request<void>(`${API_ROUTES.incidents}/${id}`, {
    method: "DELETE",
  });
}

/**
 * Advance an incident through its lifecycle. The backend enforces the
 * `ALLOWED_TRANSITIONS` graph and responds 409 on invalid moves — that
 * error surfaces to the caller via the thrown `Error`.
 */
export async function transitionIncident(
  id: string,
  nextPhase: string,
): Promise<Incident> {
  const query = new URLSearchParams({ next_phase: nextPhase });
  return request<Incident>(
    `${API_ROUTES.incidents}/${id}/transition?${query.toString()}`,
    { method: "POST" },
  );
}

/* ------------------------------------------------------------------ */
/* AI Agent                                                            */
/* ------------------------------------------------------------------ */

export async function investigate(
  incidentDescription: string,
): Promise<InvestigationResponse> {
  return request<InvestigationResponse>(API_ROUTES.agentInvestigate, {
    method: "POST",
    body: JSON.stringify({ incident_description: incidentDescription }),
  });
}

/* ------------------------------------------------------------------ */
/* App + live tool telemetry                                           */
/* ------------------------------------------------------------------ */

export async function getAppHealth(): Promise<AppHealth> {
  return request<AppHealth>(API_ROUTES.appHealth);
}

export async function getToolsHealth(): Promise<ToolsHealth> {
  return request<ToolsHealth>(API_ROUTES.toolsHealth);
}

export async function getToolsMetrics(): Promise<ToolsMetrics> {
  return request<ToolsMetrics>(API_ROUTES.toolsMetrics);
}

export async function getToolsLogs(): Promise<ToolsLogs> {
  return request<ToolsLogs>(API_ROUTES.toolsLogs);
}