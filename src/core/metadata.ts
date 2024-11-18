import { SwifliMetadata } from "./types";

import { HttpClient } from '../utils/http';
import { ILogger } from '../core/types';

export class MetadataService {
    constructor(
      private readonly httpClient: HttpClient,
      private readonly logger: ILogger
    ) {}
  
    private getMetadataUrl(id: string): string {
      return `https://raw.githubusercontent.com/23stud-io/swifli-registry/refs/heads/main/${id}.json`;
    }
  
    async getMetadataById(id: string): Promise<SwifliMetadata> {
      const url = this.getMetadataUrl(id);
      try {
        const metadata = await this.httpClient.get<SwifliMetadata>(url);
        this.logger.log('Fetched metadata:', metadata);
        return metadata;
      } catch (error) {
        this.logger.error('Error fetching metadata:', error);
        throw error;
      }
    }
  
    extractIdFromUrl(url: string): string | null {
      const match = url.match(/\/([^/]+)$/);
      return match ? match[1] : null;
    }
}