import { v4 as uuidv4 } from 'uuid';
import { DistributedEvent, QueueMetrics, ServiceName } from '@payment-system/shared-types';

export interface QueueJob<T = any> {
  id: string;
  event: DistributedEvent<T>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER';
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: string;
  processedAt?: string;
}

export type EventHandler<T = any> = (event: DistributedEvent<T>) => Promise<void>;

export class DistributedEventBroker {
  private subscribers = new Map<string, EventHandler[]>();
  private activeJobs: QueueJob[] = [];
  private completedJobs: QueueJob[] = [];
  private deadLetterQueue: QueueJob[] = [];
  private eventLogs: DistributedEvent[] = [];
  private isProcessing = false;
  private maxRetries = 3;
  private totalEventsProcessed = 0;
  private startTime = Date.now();

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  public subscribe<T = any>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.subscribers.get(eventType) || [];
    handlers.push(handler as EventHandler);
    this.subscribers.set(eventType, handlers);
  }

  public async publish<T = any>(
    eventType: string,
    payload: T,
    sourceService: ServiceName,
    correlationId?: string
  ): Promise<DistributedEvent<T>> {
    const event: DistributedEvent<T> = {
      eventId: `evt_${uuidv4().substring(0, 8)}`,
      eventType,
      correlationId: correlationId || `corr_${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString(),
      sourceService,
      payload,
      retryCount: 0,
    };

    // Keep last 200 event logs for operations dashboard
    this.eventLogs.unshift(event);
    if (this.eventLogs.length > 200) {
      this.eventLogs.pop();
    }

    const job: QueueJob<T> = {
      id: `job_${uuidv4().substring(0, 8)}`,
      event,
      status: 'PENDING',
      attempts: 0,
      maxAttempts: this.maxRetries,
      createdAt: new Date().toISOString(),
    };

    this.activeJobs.push(job);
    this.processNextJobs();

    return event;
  }

  private async processNextJobs(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.activeJobs.length > 0) {
        const job = this.activeJobs.shift();
        if (!job) break;

        job.status = 'PROCESSING';
        job.attempts++;

        const handlers = this.subscribers.get(job.event.eventType) || [];
        
        let hasError = false;
        let lastErrorMessage = '';

        for (const handler of handlers) {
          try {
            await handler(job.event);
          } catch (err: any) {
            hasError = true;
            lastErrorMessage = err.message || 'Unknown event processing error';
          }
        }

        if (hasError) {
          job.error = lastErrorMessage;
          if (job.attempts >= job.maxAttempts) {
            job.status = 'DEAD_LETTER';
            job.processedAt = new Date().toISOString();
            this.deadLetterQueue.unshift(job);
            if (this.deadLetterQueue.length > 100) this.deadLetterQueue.pop();
          } else {
            job.status = 'PENDING';
            job.event.retryCount = job.attempts;
            // Delay before re-queueing
            setTimeout(() => {
              this.activeJobs.push(job);
              this.processNextJobs();
            }, Math.min(500 * Math.pow(2, job.attempts), 4000));
          }
        } else {
          job.status = 'COMPLETED';
          job.processedAt = new Date().toISOString();
          this.totalEventsProcessed++;
          this.completedJobs.unshift(job);
          if (this.completedJobs.length > 100) this.completedJobs.pop();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public async replayDeadLetterJob(jobId: string): Promise<boolean> {
    const index = this.deadLetterQueue.findIndex(j => j.id === jobId);
    if (index === -1) return false;

    const [job] = this.deadLetterQueue.splice(index, 1);
    job.status = 'PENDING';
    job.attempts = 0;
    delete job.error;
    this.activeJobs.push(job);
    this.processNextJobs();
    return true;
  }

  public getDeadLetterQueue(): QueueJob[] {
    return [...this.deadLetterQueue];
  }

  public getRecentEvents(limit = 50): DistributedEvent[] {
    return this.eventLogs.slice(0, limit);
  }

  public getMetrics(): QueueMetrics {
    const elapsedMinutes = Math.max((Date.now() - this.startTime) / 60000, 0.1);
    const rate = Math.round(this.totalEventsProcessed / elapsedMinutes);

    return {
      activeJobs: this.activeJobs.length,
      waitingJobs: this.activeJobs.filter(j => j.status === 'PENDING').length,
      completedJobs: this.completedJobs.length,
      failedJobs: this.deadLetterQueue.length,
      delayedJobs: 0,
      deadLetterQueueCount: this.deadLetterQueue.length,
      eventProcessingRatePerMin: rate,
    };
  }

  public clear(): void {
    this.activeJobs = [];
    this.completedJobs = [];
    this.deadLetterQueue = [];
    this.eventLogs = [];
  }
}

// Global Singleton Event Broker for the Distributed System
export const globalEventBroker = new DistributedEventBroker();
