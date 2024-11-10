import { TrustedDomainsResponse, Registry, ILogger } from './types';
import { HttpClient } from '../utils/http';
import { DomainValidator } from '../utils/validation';

export class DomainRegistry implements Registry {
  constructor(
    private readonly registryUrl: string,
    private readonly defaultDomains: string[],
    private readonly logger: ILogger,
    private readonly httpClient: HttpClient
  ) {}

  async fetchDomains(): Promise<string[]> {
    try {
      const data = await this.httpClient.get<TrustedDomainsResponse>(this.registryUrl);
      
      // Validate and sanitize domains
      const validDomains = data.trusted_domains
        .map(domain => DomainValidator.sanitizeDomain(domain))
        .filter(domain => DomainValidator.isValidDomain(domain));

      this.logger.log('Fetched and validated domains:', validDomains);
      return validDomains;
    } catch (error) {
      this.logger.error('Error fetching domains:', error);
      throw error;
    }
  }

  getDefaultDomains(): string[] {
    return this.defaultDomains
      .map(domain => DomainValidator.sanitizeDomain(domain))
      .filter(domain => DomainValidator.isValidDomain(domain));
  }
}