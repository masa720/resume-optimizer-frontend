import { createClient } from "./supabase/client";
import { Analysis } from "./types";

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("API URL is not defined in environment variables");
  }
  return url;
};

const getAuthHeaders = async () => {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) {
    throw new ApiError(401, "User is not authenticated");
  }
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.error || `Request failed with status ${res.status}`;

    if (res.status === 401) {
      throw new ApiError(401, "Session expired. Please sign in again.");
    }

    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
};

export const createAnalysis = async (body: {
  jobDescription: string;
  resumeText: string;
  companyName: string;
  jobPosition: string;
}): Promise<Analysis> => {
  const res = await fetch(`${getApiUrl()}/analyses`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse<Analysis>(res);
};

export const fetchAnalyses = async (): Promise<Analysis[]> => {
  const res = await fetch(`${getApiUrl()}/analyses`, {
    headers: await getAuthHeaders(),
  });

  return handleResponse<Analysis[]>(res);
};

export const fetchAnalysisById = async (id: string): Promise<Analysis> => {
  const res = await fetch(`${getApiUrl()}/analyses/${id}`, {
    headers: await getAuthHeaders(),
  });

  return handleResponse<Analysis>(res);
};

export const deleteAnalysis = async (id: string): Promise<void> => {
  const res = await fetch(`${getApiUrl()}/analyses/${id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  await handleResponse(res);
};
