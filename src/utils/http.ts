import { ILogger } from '../core/types';

interface RetryConfig {
  attempts: number;
  delay: number;
}

export class HttpClient {
  constructor(
    private readonly logger: ILogger,
    private readonly retryConfig: RetryConfig = { attempts: 3, delay: 1000 }
  ) {}

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(url: string): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryConfig.attempts; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < this.retryConfig.attempts) {
          await this.delay(this.retryConfig.delay);
        }
      }
    }

    throw lastError || new Error('Request failed');
  }
}

export const createHttpClient = (logger: ILogger, retryConfig?: RetryConfig) => {
  return new HttpClient(logger, retryConfig);
};