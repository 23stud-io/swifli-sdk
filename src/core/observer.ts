import { ILogger } from './types';

export class TwitterObserver {
  private observer?: MutationObserver;
  private isObserving: boolean = false;

  constructor(
    private readonly logger: ILogger,
    private readonly onTweetFound: (element: Element) => void
  ) {}

  observe(): void {
    if (this.isObserving) {
      this.logger.warn('Observer is already running');
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const tweets = node.querySelectorAll('[data-testid="tweetText"]');
              tweets.forEach(this.onTweetFound);
            }
          });
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.isObserving = true;
    this.logger.log('Twitter observer started');
  }

  processExistingTweets(): void {
    const tweets = document.querySelectorAll('[data-testid="tweetText"]');
    tweets.forEach(this.onTweetFound);
    this.logger.log(`Processed ${tweets.length} existing tweets`);
  }

  disconnect(): void {
    if (!this.isObserving) {
      return;
    }

    this.observer?.disconnect();
    this.isObserving = false;
    this.logger.log('Twitter observer disconnected');
  }
}