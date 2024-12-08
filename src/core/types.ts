import { EventEmitter } from '../utils/events';

export interface SnappyConfig {
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

export type SnappyEventMap = {
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

export interface SnappyMetadata {
  contract: string;
  name: string;
  description: string;
  image: string;
  website: string;
  network: string;
  abi: any[];
}