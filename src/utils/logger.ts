import { ILogger } from '../core/types';

export class Logger implements ILogger {
  constructor(private readonly debug: boolean) {}

  private formatMessage(level: string, ...args: any[]): string {
    return `[Snappy SDK ${level}] ${args.join(' ')}`;
  }

  log(...args: any[]): void {
    if (this.debug) {
      console.log(this.formatMessage('✨', ...args));
    }
  }

  error(...args: any[]): void {
    if (this.debug) {
      console.error(this.formatMessage('❌', ...args));
    }
  }

  warn(...args: any[]): void {
    if (this.debug) {
      console.warn(this.formatMessage('⚠️', ...args));
    }
  }

  info(...args: any[]): void {
    if (this.debug) {
      console.info(this.formatMessage('ℹ️', ...args));
    }
  }
}