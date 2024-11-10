export class DomainValidator {
    static isValidDomain(domain: string): boolean {
      if (!domain) return false;
      
      // Basic domain validation regex
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
      return domainRegex.test(domain);
    }
  
    static sanitizeDomain(domain: string): string {
      return domain.toLowerCase().trim();
    }
  }