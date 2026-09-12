import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Layers, RotateCcw, Play, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

export const QueueInspectorPage: React.FC = () => {
  const [dlqJobs, setDlqJobs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const toast = useToast();

  const fetchQueueData = async () => {
    try {
      const [dlqRes, qRes] = await Promise.all([
        api.monitoring.getDlq(),
        api.monitoring.getQueues(),
      ]);

      if (dlqRes.success && dlqRes.data) setDlqJobs(dlqRes.data);
      if (qRes.success && qRes.data) setMetrics(qRes.data.metrics);
    } catch (e) {}
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReplayJob = async (id: string) => {
    try {
      const res = await api.monitoring.replayDlqJob(id);
      if (res.success) {
        toast.success('Job Re-enqueued', `Job ${id} re-enqueued for worker processing.`);
        fetchQueueData();
      }
    } catch (e: any) {
      toast.error('Replay Failed', e.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-800" /> Distributed Message Queue & Dead-Letter Queue (DLQ)
        </h2>
        <p className="text-xs text-slate-500">
          Inspect worker queues, exponential retry state, and dead-lettered messages with single-click re-queue replay.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Queue Jobs</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics?.activeJobs || 0}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Currently in flight</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Jobs</span>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">{metrics?.completedJobs || 0}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Successfully acknowledged</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dead Letter Messages</span>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">{dlqJobs.length}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Exhausted max 3 retries</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Processing Velocity</span>
          <h3 className="text-2xl font-bold text-emerald-800 mt-1">{metrics?.eventProcessingRatePerMin || 0} /min</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Worker throughput</p>
        </div>
      </div>

      {/* DLQ Messages List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Dead-Letter Queue (DLQ) Message Pool
          </h4>
          <span className="text-xs text-slate-500 font-medium">{dlqJobs.length} Dead Messages</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Job ID</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Attempts</th>
                <th className="py-3.5 px-4">Error Diagnostics</th>
                <th className="py-3.5 px-4">Failed At</th>
                <th className="py-3.5 px-4 text-right">DLQ Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {dlqJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    Dead-Letter Queue is empty. No poison-pill or failed worker messages.
                  </td>
                </tr>
              ) : (
                dlqJobs.map(job => (
                  <tr key={job.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600">{job.id}</td>
                    <td className="py-3.5 px-4 text-emerald-900 font-bold">{job.event.eventType}</td>
                    <td className="py-3.5 px-4 text-rose-600 font-bold">
                      {job.attempts} / {job.maxAttempts}
                    </td>
                    <td className="py-3.5 px-4 text-rose-700 font-sans max-w-xs truncate">{job.error || 'Max retries exhausted'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(job.processedAt || job.createdAt).toLocaleTimeString()}</td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        onClick={() => handleReplayJob(job.id)}
                        className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto shadow-2xs transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3" /> Replay to Queue
                      </button>
                    </td>
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
