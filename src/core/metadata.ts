import { SnappyMetadata } from "./types";

import { HttpClient } from '../utils/http';
import { ILogger } from '../core/types';

export class MetadataService {
    constructor(
      private readonly httpClient: HttpClient,
      private readonly logger: ILogger
    ) {}
  
    private getMetadataUrl(id: string): string {
      return `https://raw.githubusercontent.com/23stud-io/snappy-registry/refs/heads/main/${id}.json`;
    }
  
    extractIdFromText(text: string): string | null {
      // Match URLs in the text
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = text.match(urlRegex);
      
      if (!matches) return null;
  
      for (const url of matches) {
        try {
          const parsedUrl = new URL(url);
          // Get the last part of the path
          const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            return pathParts[pathParts.length - 1];
          }
        } catch (e) {
          this.logger.error('Error parsing URL:', e);
        }
      }
  
      return null;
    }
  
    async getMetadataById(id: string): Promise<SnappyMetadata> {
      const url = this.getMetadataUrl(id);
      try {
        const metadata = await this.httpClient.get<SnappyMetadata>(url);
        this.logger.log('Fetched metadata:', metadata);
        return metadata;
      } catch (error) {
        this.logger.error('Error fetching metadata:', error);
        throw error;
      }
    }
  }