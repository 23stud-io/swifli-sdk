import { ValidationResult, ValidationError } from './types';
// import { Registry } from './registry';

export class URLDetector {
    private registry: Registry;

    constructor(registry: Registry) {
        this.registry = registry;
    }

    /**
     * Extract domain from URL
     */
    private extractDomain(url: string): string {
        try {
            const urlObject = new URL(url.startsWith('http') ? url : `https://${url}`);
            return urlObject.hostname;
        } catch (error) {
            throw new ValidationError(`Invalid URL format: ${url}`);
        }
    }

    /**
     * Validate URL format and domain
     */
    public async validateUrl(url: string): Promise<ValidationResult> {
        try {
            const domain = this.extractDomain(url);
            const isTrusted = await this.registry.isDomainTrusted(domain);

            return {
                isValid: isTrusted,
                domain,
                error: isTrusted ? undefined : 'Domain not trusted'
            };
        } catch (error) {
            return {
                isValid: false,
                domain: '',
                error: error.message
            };
        }
    }

    /**
     * Check if URL matches action pattern
     */
    public isActionUrl(url: string): boolean {
        try {
            const urlObject = new URL(url.startsWith('http') ? url : `https://${url}`);
            // Check if path exists and is not just "/"
            return urlObject.pathname.length > 1;
        } catch {
            return false;
        }
    }
}