export interface TrustedDomain {
    host: string;
    state: 'trusted' | 'untrusted';
}

export interface RegistryResponse {
    actions: TrustedDomain[];
    websites: TrustedDomain[];
}


export interface ValidationResult {
    isValid: boolean;
    domain: string;
    error?: string;
}

/**
 * Configuration types
 */
export interface SDKConfig {
    registryUrl?: string;
    proxyUrl?: string;
    debug?: boolean;
}