import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Terminal, Search, Filter, RotateCw, Play, Pause } from 'lucide-react';
import { ServiceName } from '@payment-system/shared-types';

export const LiveLogStreamPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [service, setService] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.monitoring.getLogs({
        service: service || undefined,
        level: level || undefined,
        limit: 150,
      });
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLogs();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [service, level, autoRefresh]);

  const levelColors: Record<string, string> = {
    DEBUG: 'text-slate-600 bg-slate-100 border-slate-200',
    INFO: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    WARN: 'text-amber-800 bg-amber-50 border-amber-200',
    ERROR: 'text-rose-800 bg-rose-50 border-rose-200',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-800" /> Real-time Distributed Log Stream
          </h2>
          <p className="text-xs text-slate-500">Structured JSON logs with correlation IDs aggregated across all microservices.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              autoRefresh ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xs' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {autoRefresh ? <Play className="w-3.5 h-3.5 text-emerald-700" /> : <Pause className="w-3.5 h-3.5 text-slate-500" />}
            {autoRefresh ? 'Streaming Live (2s)' : 'Stream Paused'}
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-wrap gap-3">
        <select
          value={service}
          onChange={e => setService(e.target.value)}
          className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium transition-all"
        >
          <option value="">All Services (10)</option>
          <option value="api-gateway">api-gateway (:4000)</option>
          <option value="auth-service">auth-service (:4001)</option>
          <option value="payment-service">payment-service (:4002)</option>
          <option value="transaction-service">transaction-service (:4003)</option>
          <option value="merchant-service">merchant-service (:4004)</option>
          <option value="refund-service">refund-service (:4005)</option>
          <option value="fraud-service">fraud-service (:4006)</option>
          <option value="notification-service">notification-service (:4007)</option>
          <option value="reporting-service">reporting-service (:4008)</option>
          <option value="monitoring-service">monitoring-service (:4009)</option>
        </select>

        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium transition-all"
        >
          <option value="">All Log Levels</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="DEBUG">DEBUG</option>
        </select>
      </div>

      {/* Terminal Output */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 font-mono text-xs max-h-[550px] overflow-y-auto space-y-1.5 shadow-sm">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No logs found matching filters.</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-start gap-2 hover:bg-emerald-50/40 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-100">
              <span className="text-slate-400 text-[11px] shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${levelColors[log.level] || 'text-slate-600'}`}>
                {log.level}
              </span>
              <span className="text-emerald-900 font-semibold shrink-0">[{log.service}]</span>
              {log.correlationId && (
                <span className="text-emerald-700 text-[11px] shrink-0 font-medium">{log.correlationId}</span>
              )}
              <span className="text-slate-800 flex-1">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
