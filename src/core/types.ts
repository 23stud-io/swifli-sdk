import { EventEmitter } from '../utils/events';

export interface SwifliConfig {
  registryUrl?: string;
  defaultDomains?: string[];
  debug?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface TrustedDomainsResponse {
  trusted_domains: string[];
}

export interface TweetMatch {
  tweetElement: Element;
  matchedDomain: string;
  tweetText: string | null;
  timestamp: string;
  url?: string;
}

export type SwifliEventMap = {
  'domain-list-updated': (domains: string[]) => void;
  'tweet-found': (match: TweetMatch) => void;
  'error': (error: Error) => void;
  'ready': () => void;
  'destroyed': () => void;
};

export interface Registry {
  fetchDomains(): Promise<string[]>;
  getDefaultDomains(): string[];
}

export interface Parser {
  findMatchingDomain(element: Element, domains: string[]): { found: boolean; matchedDomain?: string };
}

export interface ILogger {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
}