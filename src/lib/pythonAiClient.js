/**
 * Python AI Microservice Client & Dynamic Fallback Resolver
 * Connects to local FastAPI instance or secure public tunnel when running on Vercel.
 */

let cachedHealthyUrl = null;
let lastCheckTime = 0;

const CANDIDATES = [
  process.env.PYTHON_AI_URL,
  'http://127.0.0.1:8000',
  'https://seramikbak-ai.loca.lt',
  'https://busy-hornets-carry.loca.lt',
].filter(Boolean);

export async function getHealthyPythonUrl() {
  const now = Date.now();
  if (cachedHealthyUrl && now - lastCheckTime < 15000) {
    return cachedHealthyUrl;
  }

  const uniqueCandidates = [...new Set(CANDIDATES)];

  for (const url of uniqueCandidates) {
    try {
      const isLocal = url.includes('127.0.0.1') || url.includes('localhost');
      const res = await fetch(`${url}/api/health`, {
        headers: {
          'bypass-tunnel-reminder': '1',
          'Bypass-Tunnel-Reminder': 'true',
        },
        signal: AbortSignal.timeout(isLocal ? 1500 : 2500),
      });

      if (res.ok) {
        cachedHealthyUrl = url;
        lastCheckTime = now;
        return url;
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Default fallback
  return uniqueCandidates[0] || 'http://127.0.0.1:8000';
}

export function invalidatePythonCache() {
  cachedHealthyUrl = null;
  lastCheckTime = 0;
}
