export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number, delay: number) => void;
}

export async function executeWithRetry<T>(
  action: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 5000;
  const backoffFactor = options.backoffFactor ?? 2;
  const useJitter = options.jitter ?? true;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action(attempt);
    } catch (err: any) {
      lastError = err;

      if (attempt === maxAttempts) {
        break;
      }

      if (options.shouldRetry && !options.shouldRetry(err)) {
        throw err;
      }

      // Calculate exponential backoff delay
      let delay = baseDelayMs * Math.pow(backoffFactor, attempt - 1);
      if (useJitter) {
        // Full jitter
        delay = Math.random() * delay;
      }
      delay = Math.min(delay, maxDelayMs);

      if (options.onRetry) {
        options.onRetry(err, attempt, delay);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
