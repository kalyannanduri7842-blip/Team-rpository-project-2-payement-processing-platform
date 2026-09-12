import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Server, Cpu, HardDrive, Clock, Activity, RotateCw } from 'lucide-react';

export const ServicesHealthPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.monitoring.getServices();
      if (res.success && res.data) {
        setServices(res.data.services);
      }
    } catch (e) {}
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-800" /> Microservices Health & Node Diagnostics
          </h2>
          <p className="text-xs text-slate-500">Live telemetry, memory metrics, CPU utilization, and latency across all 10 microservices.</p>
        </div>
        <button
          onClick={fetchHealth}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => {
          const isDown = s.status === 'DOWN';
          const isDegraded = s.status === 'DEGRADED';

          return (
            <div
              key={s.service}
              className={`p-5 rounded-2xl border transition-all space-y-4 shadow-sm ${
                isDown
                  ? 'bg-rose-50/70 border-rose-300'
                  : isDegraded
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{s.service}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{s.instanceId}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <Activity className="w-3 h-3 text-emerald-700" /> Latency
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{s.latencyMs} ms</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <HardDrive className="w-3 h-3 text-emerald-700" /> Memory
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{s.memoryUsageMb} MB</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <Cpu className="w-3 h-3 text-emerald-700" /> CPU Load
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{s.cpuUsage}%</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-emerald-700" /> Uptime
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{s.uptimeSeconds}s</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
                <span>Requests: {s.requestCount}</span>
                <span>Errors: {s.errorCount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
