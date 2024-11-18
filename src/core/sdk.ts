import { EventEmitter } from '../utils/events';
import { SwifliConfig, SwifliEventMap, TweetMatch, ILogger, SwifliMetadata } from './types';
import { DomainRegistry } from './registry';
import { TwitterParser } from './parser';
import { TwitterObserver } from './observer';
import { Logger } from '../utils/logger';
import { createHttpClient } from '../utils/http';
import { MetadataService } from './metadata';

export class SwifliTwitterSDK extends EventEmitter {
  private static instance: SwifliTwitterSDK;
  private domains: string[];
  private readonly config: Required<SwifliConfig>;
  private isInitialized: boolean = false;
  private readonly logger: ILogger;
  private readonly registry: DomainRegistry;
  private readonly parser: TwitterParser;
  private readonly observer: TwitterObserver;
  private readonly metadataService: MetadataService;

  private readonly DEFAULT_CONFIG: Required<SwifliConfig> = {
    registryUrl: 'https://raw.githubusercontent.com/23stud-io/swifli-registry/refs/heads/main/trusted_domains.json',
    defaultDomains: ['swifli-frontend.vercel.app'],
    debug: false,
    retryAttempts: 3,
    retryDelay: 1000
  };

  private constructor(config: SwifliConfig = {}) {
    super();
    this.config = { ...this.DEFAULT_CONFIG, ...config };
    this.domains = [...this.config.defaultDomains];

    // Initialize components
    this.logger = new Logger(this.config.debug);
    const httpClient = createHttpClient(this.logger, {
      attempts: this.config.retryAttempts,
      delay: this.config.retryDelay
    });

    this.metadataService = new MetadataService(httpClient, this.logger);
    this.registry = new DomainRegistry(
      this.config.registryUrl,
      this.config.defaultDomains,
      this.logger,
      httpClient
    );
    this.parser = new TwitterParser(this.logger);
    this.observer = new TwitterObserver(
      this.logger,
      this.processTweet.bind(this)
    );
  }

  public static getInstance(config?: SwifliConfig): SwifliTwitterSDK {
    if (!SwifliTwitterSDK.instance) {
      SwifliTwitterSDK.instance = new SwifliTwitterSDK(config);
    }
    return SwifliTwitterSDK.instance;
  }

  async getMetadataForUrl(url: string): Promise<SwifliMetadata | null> {
    const id = this.metadataService.extractIdFromUrl(url);
    if (!id) return null;
    return this.metadataService.getMetadataById(id);
  }

  private processTweet = (tweetElement: Element): void => {
    const { found, matchedDomain, url } = this.parser.findMatchingDomain(tweetElement, this.domains);
    
    if (found && matchedDomain) {
      const match: TweetMatch = {
        tweetElement,
        matchedDomain,
        tweetText: tweetElement.textContent,
        timestamp: new Date().toISOString(),
        url
      };

      this.emit('tweet-found', match);
    }
  };

  private async updateDomains(): Promise<void> {
    try {
      const newDomains = await this.registry.fetchDomains();
      this.domains = newDomains;
      this.emit('domain-list-updated', this.domains);
      
      // Process existing tweets with new domains
      this.observer.processExistingTweets();
    } catch (error) {
      this.logger.error('Using default domains due to error:', error);
      this.domains = this.registry.getDefaultDomains();
      this.emit('error', error as Error);
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('SDK is already initialized');
      return;
    }

    try {
      await this.updateDomains();
      this.observer.observe();
      this.isInitialized = true;
      this.emit('ready');
      this.logger.log('SDK initialized successfully');
    } catch (error) {
      this.logger.error('Initialization error:', error);
      this.emit('error', error as Error);
      throw error;
    }
  }

  public getCurrentDomains(): string[] {
    return [...this.domains];
  }

  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    this.observer.disconnect();
    // this.removeAllListeners();
    this.isInitialized = false;
    this.logger.log('SDK destroyed');
    this.emit('destroyed');
  }

  // Type-safe event emitter methods
  public on<K extends keyof SwifliEventMap>(event: K, listener: SwifliEventMap[K]): this {
    return super.on(event, listener);
  }

  public emit<K extends keyof SwifliEventMap>(event: K, ...args: Parameters<SwifliEventMap[K]>): boolean {
    return super.emit(event, ...args);
  }
}