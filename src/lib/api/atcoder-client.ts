import type { Problem, ProblemModel, Contest } from "@/types";

const BASE_URL = "https://kenkoooo.com/atcoder/resources";

// Rate limiter: minimum 1 second between requests
let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response;
}

export async function fetchProblems(): Promise<Problem[]> {
  const response = await rateLimitedFetch(`${BASE_URL}/problems.json`);
  return response.json();
}

export async function fetchProblemModels(): Promise<ProblemModel[]> {
  const response = await rateLimitedFetch(`${BASE_URL}/problem-models.json`);
  const data = await response.json();
  // The API returns an object keyed by problem_id
  return Object.entries(data).map(([problem_id, model]) => ({
    problem_id,
    ...(model as Omit<ProblemModel, "problem_id">),
  }));
}

export async function fetchContests(): Promise<Contest[]> {
  const response = await rateLimitedFetch(`${BASE_URL}/contests.json`);
  return response.json();
}
