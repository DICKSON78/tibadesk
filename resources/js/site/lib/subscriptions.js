const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' };

async function parse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body.message ?? body.error ?? 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.fields = body.errors ?? {};
    error.status = response.status;
    throw error;
  }

  return body;
}

export async function createSubscription(payload) {
  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  return parse(response);
}

export async function fetchSubscription(reference) {
  const response = await fetch(`/api/subscriptions/${reference}`, { headers: { Accept: 'application/json' } });

  return parse(response);
}

export async function simulatePayment(reference) {
  const response = await fetch(`/api/subscriptions/${reference}/simulate-payment`, {
    method: 'POST',
    headers: jsonHeaders,
  });

  return parse(response);
}

export function downloadUrl(reference, artifact) {
  return `/api/subscriptions/${reference}/download?artifact=${artifact}`;
}
