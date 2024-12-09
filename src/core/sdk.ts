import { EventEmitter } from '../utils/events';
import { SnappyConfig, SnappyEventMap, TweetMatch, ILogger, SnappyMetadata } from './types';
import { DomainRegistry } from './registry';
import { TwitterParser } from './parser';
import { TwitterObserver } from './observer';
import { Logger } from '../utils/logger';
import { createHttpClient } from '../utils/http';
import { MetadataService } from './metadata';

export class SnappyTwitterSDK extends EventEmitter {
  private static instance: SnappyTwitterSDK;
  private domains: string[];
  private readonly config: Required<SnappyConfig>;
  private isInitialized: boolean = false;
  private readonly logger: ILogger;
  private readonly registry: DomainRegistry;
  private readonly parser: TwitterParser;
  private readonly observer: TwitterObserver;
  private readonly metadataService: MetadataService;
  private processedTweets = new WeakSet<Element>();
  private processingQueue = new Set<string>();
  private isProcessing = false;

  private readonly DEFAULT_CONFIG: Required<SnappyConfig> = {
    registryUrl: 'https://raw.githubusercontent.com/23stud-io/Snappy-registry/refs/heads/main/trusted_domains.json',
    defaultDomains: ['Snappy-frontend.vercel.app'],
    debug: false,
    retryAttempts: 3,
    retryDelay: 1000
  };

  private constructor(config: SnappyConfig = {}) {
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
      this.queueTweetProcessing.bind(this)
    );
  }

  public static getInstance(config?: SnappyConfig): SnappyTwitterSDK {
    if (!SnappyTwitterSDK.instance) {
      SnappyTwitterSDK.instance = new SnappyTwitterSDK(config);
    }
    return SnappyTwitterSDK.instance;
  }

  private getTweetId(element: Element): string {
    const article = element.closest('article');
    const text = element.textContent || '';
    const timestamp = article?.querySelector('time')?.getAttribute('datetime') || Date.now().toString();
    return `${text}-${timestamp}`;
  }

  private queueTweetProcessing(tweetElement: Element): void {
    const tweetId = this.getTweetId(tweetElement);
    
    if (this.processingQueue.has(tweetId) || this.processedTweets.has(tweetElement)) {
      this.logger.log('Tweet already queued or processed:', tweetId);
      return;
    }

    this.processingQueue.add(tweetId);
    this.scheduleProcessing();
  }

  private scheduleProcessing(): void {
    if (this.isProcessing) return;
    
    requestAnimationFrame(() => {
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      const tweets = document.querySelectorAll('[data-testid="tweetText"]');
      
      for (const tweet of tweets) {
        const tweetId = this.getTweetId(tweet);
        
        if (this.processedTweets.has(tweet)) {
          this.processingQueue.delete(tweetId);
          continue;
        }

        const { found, matchedDomain, url } = this.parser.findMatchingDomain(tweet, this.domains);
        
        if (found && matchedDomain) {
          const match: TweetMatch = {
            tweetElement: tweet,
            matchedDomain,
            tweetText: tweet.textContent,
            timestamp: new Date().toISOString(),
            url
          };

          this.processedTweets.add(tweet);
          this.emit('tweet-found', match);
        }

        this.processingQueue.delete(tweetId);
      }
    } finally {
      this.isProcessing = false;
      
      if (this.processingQueue.size > 0) {
        this.scheduleProcessing();
      }
    }
  }

  async getMetadataForTweet(match: TweetMatch): Promise<SnappyMetadata | null> {
    const tweetText = match.tweetText;
    if (!tweetText) return null;

    const id = this.metadataService.extractIdFromText(tweetText);
    this.logger.log('Extracted ID from tweet text:', id);
    
    if (!id) return null;
    return this.metadataService.getMetadataById(id);
  }

  async getMetadataForUrl(url: string): Promise<SnappyMetadata | null> {
    const id = this.metadataService.extractIdFromText(url);
    if (!id) return null;
    return this.metadataService.getMetadataById(id);
  }

  async getMetadataById(id: string): Promise<SnappyMetadata | null> {
    if (!id) return null;
    return this.metadataService.getMetadataById(id);
  }

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
    this.processedTweets = new WeakSet();
    this.processingQueue.clear();
    this.isInitialized = false;
    this.logger.log('SDK destroyed');
    this.emit('destroyed');
  }

  public on<K extends keyof SnappyEventMap>(event: K, listener: SnappyEventMap[K]): this {
    return super.on(event, listener);
  }

  public emit<K extends keyof SnappyEventMap>(event: K, ...args: Parameters<SnappyEventMap[K]>): boolean {
    return super.emit(event, ...args);
  }
}