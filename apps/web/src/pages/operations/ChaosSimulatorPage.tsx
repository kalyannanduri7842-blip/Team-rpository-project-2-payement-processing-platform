import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Flame, ShieldAlert, Zap, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { ServiceName } from '@payment-system/shared-types';

export const ChaosSimulatorPage: React.FC = () => {
  const [configs, setConfigs] = useState<any[]>([]);
  const toast = useToast();

  const fetchConfigs = async () => {
    const res = await api.monitoring.getChaosConfigs();
    if (res.success && res.data) {
      setConfigs(res.data);
    }
  };

  useEffect(() => {
    fetchConfigs();
    const interval = setInterval(fetchConfigs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFailure = async (service: ServiceName, current: boolean) => {
    try {
      const res = await api.monitoring.setChaosConfig({
        service,
        simulateFailure: !current,
      });
      if (res.success) {
        toast.warning(
          !current ? `Chaos Injected: ${service} is DOWN` : `Chaos Cleared: ${service} Restored`,
          !current ? 'Circuit breaker will fast-fail incoming requests' : 'Normal execution resumed'
        );
        fetchConfigs();
      }
    } catch (e: any) {
      toast.error('Error', e.message);
    }
  };

  const handleSetLatency = async (service: ServiceName, latency: number) => {
    try {
      const res = await api.monitoring.setChaosConfig({
        service,
        injectedLatencyMs: latency,
      });
      if (res.success) {
        toast.info(`Injected ${latency}ms latency into ${service}`);
        fetchConfigs();
      }
    } catch (e: any) {
      toast.error('Error', e.message);
    }
  };

  const handleResetAll = async () => {
    try {
      const res = await api.monitoring.resetChaos();
      if (res.success) {
        toast.success('Chaos Reset', 'All services restored to normal healthy states.');
        fetchConfigs();
      }
    } catch (e: any) {
      toast.error('Error', e.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600" /> Chaos Engineering & Fault Injection Studio
          </h2>
          <p className="text-xs text-slate-500">
            Inject synthetic packet latency, simulate service crashes, force-trip circuit breakers, and observe real-time system resilience.
          </p>
        </div>

        <button
          onClick={handleResetAll}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-800" /> Reset All Injections to Normal
        </button>
      </div>

      {/* Preset Scenarios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Scenario A: Crash Payment Service
          </span>
          <p className="text-[11px] text-slate-600">
            Simulates instant service failure on :4002. Trips Circuit Breaker OPEN on API Gateway.
          </p>
          <button
            onClick={() => handleToggleFailure('payment-service', false)}
            className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Trigger Scenario A
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
            <Clock className="w-4 h-4 text-amber-600" /> Scenario B: 1,500ms Latency Spike
          </span>
          <p className="text-[11px] text-slate-600">
            Injects 1,500ms network latency into Fraud Service (:4006) to test gateway timeout tolerance.
          </p>
          <button
            onClick={() => handleSetLatency('fraud-service', 1500)}
            className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Trigger Scenario B
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
            <Zap className="w-4 h-4 text-emerald-700" /> Scenario C: Degrade Notification Svc
          </span>
          <p className="text-[11px] text-slate-600">
            Injects intermittent failures on :4007 to test event bus asynchronous decoupling.
          </p>
          <button
            onClick={() => handleToggleFailure('notification-service', false)}
            className="w-full py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Trigger Scenario C
          </button>
        </div>
      </div>

      {/* Interactive Microservice Injections Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Service Fault Injection Grid</h3>
          <span className="text-xs text-slate-500 font-medium">10 Microservice Targets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Target Microservice</th>
                <th className="py-3.5 px-4">Circuit Breaker</th>
                <th className="py-3.5 px-4">Simulate 503 Crash</th>
                <th className="py-3.5 px-4">Synthetic Latency</th>
                <th className="py-3.5 px-4 text-right">Quick Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {configs.map(cfg => (
                <tr key={cfg.service} className="hover:bg-emerald-50/30 transition-colors text-slate-700">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{cfg.service}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={cfg.circuitBreakerTripped ? 'OPEN' : 'CLOSED'} />
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleFailure(cfg.service, cfg.simulateFailure)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        cfg.simulateFailure
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cfg.simulateFailure ? '🔥 CRASHED (503)' : 'Healthy'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="3000"
                        step="250"
                        value={cfg.injectedLatencyMs || 0}
                        onChange={e => handleSetLatency(cfg.service, parseInt(e.target.value, 10))}
                        className="w-28 accent-emerald-800 cursor-pointer"
                      />
                      <span className="text-slate-800 font-bold">{cfg.injectedLatencyMs || 0}ms</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {(cfg.simulateFailure || cfg.injectedLatencyMs > 0) && (
                      <button
                        onClick={() => {
                          api.monitoring.setChaosConfig({ service: cfg.service, simulateFailure: false, injectedLatencyMs: 0 });
                          fetchConfigs();
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-lg font-semibold transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
