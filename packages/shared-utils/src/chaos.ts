import { ChaosConfig, ServiceName } from '@payment-system/shared-types';
import { getCircuitBreaker } from './circuit-breaker';

class ChaosEngine {
  private configs = new Map<ServiceName, ChaosConfig>();

  constructor() {
    const services: ServiceName[] = [
      'api-gateway',
      'auth-service',
      'payment-service',
      'transaction-service',
      'merchant-service',
      'refund-service',
      'fraud-service',
      'notification-service',
      'reporting-service',
      'monitoring-service',
    ];

    for (const s of services) {
      this.configs.set(s, {
        service: s,
        simulateFailure: false,
        injectedLatencyMs: 0,
        failureRate: 0,
      });
    }
  }

  public getConfig(service: ServiceName): ChaosConfig {
    return this.configs.get(service) || {
      service,
      simulateFailure: false,
      injectedLatencyMs: 0,
      failureRate: 0,
    };
  }

  public getAllConfigs(): ChaosConfig[] {
    return Array.from(this.configs.values()).map(c => {
      const cb = getCircuitBreaker(c.service);
      return {
        ...c,
        circuitBreakerTripped: cb.getState() === 'OPEN',
      };
    });
  }

  public setConfig(service: ServiceName, update: Partial<ChaosConfig>): ChaosConfig {
    const current = this.getConfig(service);
    const updated: ChaosConfig = {
      ...current,
      ...update,
      service,
    };
    this.configs.set(service, updated);

    if (update.simulateFailure) {
      const cb = getCircuitBreaker(service);
      cb.trip();
    } else if (update.simulateFailure === false) {
      const cb = getCircuitBreaker(service);
      cb.reset();
    }

    return updated;
  }

  public resetAll(): void {
    for (const service of this.configs.keys()) {
      this.configs.set(service, {
        service,
        simulateFailure: false,
        injectedLatencyMs: 0,
        failureRate: 0,
      });
      const cb = getCircuitBreaker(service);
      cb.reset();
    }
  }

  public async applyChaos(service: ServiceName): Promise<void> {
    const config = this.getConfig(service);

    // Apply injected latency if configured
    if (config.injectedLatencyMs > 0) {
      await new Promise(r => setTimeout(r, config.injectedLatencyMs));
    }

    // Apply simulated failure
    if (config.simulateFailure) {
      throw new Error(`[CHAOS SIMULATION] Service ${service} is simulated as DOWN (503 Service Unavailable)`);
    }

    // Apply probabilistic failure
    if (config.failureRate > 0 && Math.random() < config.failureRate) {
      throw new Error(`[CHAOS SIMULATION] Injected random failure (${config.failureRate * 100}% rate) in ${service}`);
    }
  }
}

export const chaosEngine = new ChaosEngine();
