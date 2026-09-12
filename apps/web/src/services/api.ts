const API_BASE = '/api';

/** Never JSON.parse HTML error pages — prevents Unexpected token '<' */
export class BackendHtmlError extends Error {
  constructor(message: string, public preview = '') {
    super(message);
    this.name = 'BackendHtmlError';
  }
}

function looksLikeHtml(text: string): boolean {
  const t = text.trim();
  return t.startsWith('<') || t.startsWith('<!DOCTYPE') || t.startsWith('<html');
}

async function safeJson(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  const text = await res.text();
  if (!text) {
    return { success: false, error: 'Empty response', offline: true };
  }
  if (looksLikeHtml(text) || ct.includes('text/html')) {
    console.warn('[api] HTML response (backend offline or wrong URL)');
    return {
      success: false,
      error: 'Server unavailable (received HTML instead of JSON). Is the API running on port 4000?',
      offline: true,
      html: true,
    };
  }
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      error: 'Invalid JSON from server. Backend may be down.',
      offline: true,
      raw: text.slice(0, 120),
    };
  }
}

function getAuthHeaders(): Record<string, string> {
  let token: string | null = null;
  try {
    token = localStorage.getItem('access_token');
    if (token && looksLikeHtml(token)) token = null;
  } catch {
    token = null;
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch(url: string, init?: RequestInit): Promise<any> {
  try {
    const res = await fetch(url, init);
    return await safeJson(res);
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Network error — backend unreachable',
      offline: true,
    };
  }
}


export const api = {
  // Auth
  auth: {
    login: async (credentials: any) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await safeJson(res);
    },
    register: async (data: any) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await safeJson(res);
    },
    me: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
  },

  // Payments
  payments: {
    create: async (data: any, idempotencyKey?: string) => {
      const headers = getAuthHeaders();
      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return await safeJson(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/payments?${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/payments/${id}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getStats: async (merchantId?: string) => {
      const query = merchantId ? `?merchantId=${merchantId}` : '';
      const res = await fetch(`${API_BASE}/payments/stats${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getPaymentMethods: async (customerId: string) => {
      const res = await fetch(`${API_BASE}/payments/methods/${customerId}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
  },

  // Transactions
  transactions: {
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/transactions?${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/transactions/${id}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getReceipt: async (id: string) => {
      const res = await fetch(`${API_BASE}/transactions/${id}/receipt`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
  },

  // Merchants
  merchants: {
    list: async () => {
      const res = await fetch(`${API_BASE}/merchants`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/merchants/${id}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    update: async (id: string, updates: any) => {
      const res = await fetch(`${API_BASE}/merchants/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return await safeJson(res);
    },
    getSettlements: async (merchantId: string) => {
      const res = await fetch(`${API_BASE}/merchants/${merchantId}/settlements`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    triggerSettlement: async (merchantId: string) => {
      const res = await fetch(`${API_BASE}/merchants/${merchantId}/settlements/trigger`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await safeJson(res);
    },
  },

  // Refunds
  refunds: {
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/refunds`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await safeJson(res);
    },
    list: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/refunds?${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    updateStatus: async (id: string, status: string, rejectionReason?: string) => {
      const res = await fetch(`${API_BASE}/refunds/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, rejectionReason }),
      });
      return await safeJson(res);
    },
  },

  // Fraud
  fraud: {
    evaluate: async (data: any) => {
      const res = await fetch(`${API_BASE}/fraud/evaluate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await safeJson(res);
    },
    getAlerts: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/fraud/alerts?${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    resolveAlert: async (id: string, status: string, notes?: string) => {
      const res = await fetch(`${API_BASE}/fraud/alerts/${id}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reviewNotes: notes }),
      });
      return await safeJson(res);
    },
  },

  // Notifications
  notifications: {
    list: async (userId: string) => {
      const res = await fetch(`${API_BASE}/notifications?userId=${userId}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    markAsRead: async (id: string) => {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      return await safeJson(res);
    },
    markAllAsRead: async (userId: string) => {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId }),
      });
      return await safeJson(res);
    },
  },

  // Reports
  reports: {
    getSummary: async (merchantId?: string) => {
      const query = merchantId ? `?merchantId=${merchantId}` : '';
      const res = await fetch(`${API_BASE}/reports/summary${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getRevenueTrends: async (merchantId?: string) => {
      const query = merchantId ? `?merchantId=${merchantId}` : '';
      const res = await fetch(`${API_BASE}/reports/revenue-trends${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    exportTransactionsUrl: (merchantId?: string, customerId?: string) => {
      const params = new URLSearchParams();
      if (merchantId) params.append('merchantId', merchantId);
      if (customerId) params.append('customerId', customerId);
      return `${API_BASE}/reports/export/transactions?${params.toString()}`;
    },
  },

  // Monitoring & Chaos & Audit
  monitoring: {
    getServices: async () => {
      const res = await fetch(`${API_BASE}/monitoring/services`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getQueues: async () => {
      const res = await fetch(`${API_BASE}/monitoring/queues`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getDlq: async () => {
      const res = await fetch(`${API_BASE}/monitoring/dlq`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    replayDlqJob: async (id: string) => {
      const res = await fetch(`${API_BASE}/monitoring/dlq/${id}/replay`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await safeJson(res);
    },
    getLogs: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/monitoring/logs?${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getAuditLogs: async (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/monitoring/audit-logs?${query}`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    getChaosConfigs: async () => {
      const res = await fetch(`${API_BASE}/monitoring/chaos`, { headers: getAuthHeaders() });
      return await safeJson(res);
    },
    setChaosConfig: async (config: any) => {
      const res = await fetch(`${API_BASE}/monitoring/chaos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(config),
      });
      return await safeJson(res);
    },
    resetChaos: async () => {
      const res = await fetch(`${API_BASE}/monitoring/chaos/reset`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await safeJson(res);
    },
  },
};
