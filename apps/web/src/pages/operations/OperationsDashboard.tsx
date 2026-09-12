import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Activity,
  Server,
  Layers,
  Flame,
  Terminal,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OperationsDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [queueMetrics, setQueueMetrics] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOpsData = async () => {
    setIsRefreshing(true);
    try {
      const [srvRes, qRes] = await Promise.all([
        api.monitoring.getServices(),
        api.monitoring.getQueues(),
      ]);

      if (srvRes.success) setHealthData(srvRes.data);
      if (qRes.success && qRes.data) {
        setQueueMetrics(qRes.data.metrics);
        setRecentEvents(qRes.data.recentEvents);
      }
    } catch (e) {}
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchOpsData();
    const interval = setInterval(fetchOpsData, 4000);
    return () => clearInterval(interval);
  }, []);

  const services = healthData?.services || [];
  const topology = healthData?.topology || { totalNodes: 10, healthyNodes: 10, degradedNodes: 0, downNodes: 0 };
  const circuitBreakers = healthData?.circuitBreakers || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* SRE Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border border-emerald-800/40 rounded-2xl p-6 relative overflow-hidden shadow-sm text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-300" /> Distributed Systems SRE Telemetry
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-0.5">Live Cluster Architecture & Topology</h2>
            <p className="text-xs text-emerald-100/80 mt-1">Real-time health, event streams, circuit breaker trip states, and dead-letter queues.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchOpsData}
              className="px-3.5 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 rounded-xl text-xs font-semibold border border-emerald-700/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Cluster
            </button>
            <Link
              to="/operations/chaos"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-900/20 flex items-center gap-1.5 transition-all"
            >
              <Flame className="w-4 h-4" /> Chaos Simulator
            </Link>
          </div>
        </div>
      </div>

      {/* SRE Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Microservice Nodes"
          value={`${topology.healthyNodes} / ${topology.totalNodes}`}
          subtitle="Distributed Express nodes online"
          icon={Server}
          color="emerald"
        />
        <StatCard
          title="Message Queue Throughput"
          value={`${queueMetrics?.eventProcessingRatePerMin || 0} evt/min`}
          subtitle={`${queueMetrics?.completedJobs || 0} total events routed`}
          icon={Zap}
          color="emerald"
        />
        <StatCard
          title="Dead-Letter Queue (DLQ)"
          value={queueMetrics?.deadLetterQueueCount || 0}
          subtitle="Failed messages requiring replay"
          icon={Layers}
          color={queueMetrics?.deadLetterQueueCount > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Circuit Breakers Active"
          value={circuitBreakers.length || 10}
          subtitle={`${circuitBreakers.filter((c: any) => c.state === 'OPEN').length} Tripped (Fast-Failing)`}
          icon={ShieldCheck}
          color={circuitBreakers.some((c: any) => c.state === 'OPEN') ? 'rose' : 'emerald'}
        />
      </div>

      {/* Interactive Distributed Architecture Topology Visualization */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Distributed Microservice Topology</h3>
            <p className="text-xs text-slate-500">Live request flow & event bus propagation</p>
          </div>
          <span className="text-[11px] text-emerald-800 font-mono font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> Live Telemetry
          </span>
        </div>

        {/* Node Topology Grid Map */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Layer 1: Ingress & Client */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              1. Ingress Layer
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-emerald-300 shadow-xs text-center space-y-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block mr-1" />
              <p className="text-xs font-bold text-slate-900">Client / React SPA</p>
              <p className="text-[10px] text-slate-500 font-mono">Port :5173</p>
            </div>

            <div className="flex justify-center">
              <span className="text-emerald-800 text-xs font-medium">↓ JWT + CorrelationID</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-emerald-600 shadow-xs text-center space-y-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block mr-1" />
              <p className="text-xs font-bold text-emerald-900">API Gateway Proxy</p>
              <p className="text-[10px] text-slate-500 font-mono">Port :4000</p>
              <p className="text-[10px] text-emerald-800 font-medium">Rate Limiter + Circuit Breaker</p>
            </div>
          </div>

          {/* Layer 2: Core Domain Services */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              2. Synchronous REST
            </span>
            {[
              { name: 'Auth Service', port: 4001, key: 'auth-service' },
              { name: 'Payment Service', port: 4002, key: 'payment-service' },
              { name: 'Transaction Service', port: 4003, key: 'transaction-service' },
              { name: 'Merchant Service', port: 4004, key: 'merchant-service' },
            ].map(svc => {
              const metric = services.find((s: any) => s.service === svc.key);
              const isDown = metric?.status === 'DOWN';
              return (
                <div
                  key={svc.key}
                  className={`p-3 rounded-xl border text-center transition-all shadow-2xs ${
                    isDown
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50/80 border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{svc.name}</span>
                    <span className={`text-[10px] font-mono ${isDown ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}`}>
                      {isDown ? 'DOWN' : `${metric?.latencyMs || 8}ms`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono text-left mt-0.5">:{svc.port}</p>
                </div>
              );
            })}
          </div>

          {/* Layer 3: Secondary & Risk Services */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              3. Specialized Engines
            </span>
            {[
              { name: 'Fraud & Risk Engine', port: 4006, key: 'fraud-service' },
              { name: 'Refund Service', port: 4005, key: 'refund-service' },
              { name: 'Notification Service', port: 4007, key: 'notification-service' },
              { name: 'Reporting Service', port: 4008, key: 'reporting-service' },
            ].map(svc => {
              const metric = services.find((s: any) => s.service === svc.key);
              const isDown = metric?.status === 'DOWN';
              return (
                <div
                  key={svc.key}
                  className={`p-3 rounded-xl border text-center transition-all shadow-2xs ${
                    isDown
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-slate-50/80 border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{svc.name}</span>
                    <span className={`text-[10px] font-mono ${isDown ? 'text-rose-600 font-bold' : 'text-emerald-700 font-semibold'}`}>
                      {isDown ? 'DOWN' : `${metric?.latencyMs || 8}ms`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono text-left mt-0.5">:{svc.port}</p>
                </div>
              );
            })}
          </div>

          {/* Layer 4: Event Queue, DLQ & Storage */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              4. Event Bus & Storage
            </span>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 shadow-2xs">
              <p className="font-bold text-emerald-950 flex items-center justify-between">
                <span>Distributed Event Broker</span>
                <span className="text-[10px] text-emerald-800 font-mono font-semibold">Pub/Sub</span>
              </p>
              <p className="text-[10px] text-slate-600">Active Queue: {queueMetrics?.activeJobs || 0} jobs</p>
              <p className="text-[10px] text-slate-600">DLQ Count: {queueMetrics?.deadLetterQueueCount || 0} jobs</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 shadow-2xs">
              <p className="font-bold text-slate-800">Persistence Store</p>
              <p className="text-[10px] text-slate-500 font-mono">Dual Engine (PostgreSQL / SQLite)</p>
              <p className="text-[10px] text-emerald-700 font-mono font-medium">ACID Compliant</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 shadow-2xs">
              <p className="font-bold text-slate-800">Monitoring & SRE Service</p>
              <p className="text-[10px] text-slate-500 font-mono">Port :4009</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Distributed Event Stream */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-800" /> Recent Distributed Event Bus Broadcasts
            </h3>
            <p className="text-xs text-slate-500">Live published events routed to worker queues & notification subscribers</p>
          </div>
          <Link to="/operations/queues" className="text-xs text-emerald-800 hover:text-emerald-700 font-semibold">
            Inspect Queue & DLQ →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Event ID</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Source Service</th>
                <th className="py-3 px-3">Correlation ID</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                    No distributed events recorded in current broker session.
                  </td>
                </tr>
              ) : (
                recentEvents.slice(0, 8).map(evt => (
                  <tr key={evt.eventId} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500">{evt.eventId}</td>
                    <td className="py-2.5 px-3 text-emerald-900 font-bold">{evt.eventType}</td>
                    <td className="py-2.5 px-3 text-slate-700">{evt.sourceService}</td>
                    <td className="py-2.5 px-3 text-emerald-800 font-semibold">{evt.correlationId}</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
