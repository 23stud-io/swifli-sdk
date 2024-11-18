import { Parser, ILogger } from './types';

export class TwitterParser implements Parser {
  private processedElements = new WeakSet<Element>();

  constructor(private readonly logger: ILogger) {}

  findMatchingDomain(tweetElement: Element, domains: string[]): { found: boolean; matchedDomain?: string; url?: string } {
    if (this.processedElements.has(tweetElement)) {
      this.logger.log('Tweet element already processed, skipping');
      return { found: false };
    }

    const article = tweetElement.closest('article');
    if (!article) return { found: false };

    const links = Array.from(article.querySelectorAll('a[role="link"]'));
    
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const text = link.textContent || '';

      for (const domain of domains) {
        if (href.includes(domain) || text.includes(domain)) {
          this.processedElements.add(tweetElement);
          
          this.logger.log('Found matching domain:', domain, 'in tweet');
          return { found: true, matchedDomain: domain, url: href };
        }
      }
    }

    return { found: false };
  }

  reset() {
    this.processedElements = new WeakSet<Element>();
  }
}