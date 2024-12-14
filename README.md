# Snappy SDK

A powerful SDK for detecting and processing Snappy links in Twitter's timeline. This SDK provides real-time monitoring of tweets, domain validation, and metadata retrieval capabilities.

## Installation

```bash
npm install snappy-sdk
```

## Quick Start

```typescript
import { getSnappySDK } from 'snappy-sdk';

// Initialize the SDK
const snappy = getSnappySDK();

// Listen for matched tweets
snappy.on('tweet-found', (match) => {
  console.log('Tweet found:', match);
}); 

// Get metadata for a matched tweet
const metadata = await snappy.getMetadata(match.url);
if (metadata) {
  console.log('Metadata:', metadata);
}

// Initialize the SDK
snappy.initialize().then(() => {
  console.log('SDK initialized');
}).catch((error) => {
  console.error('Error initializing SDK:', error);
});
```

## Configuration

The SDK is designed to be flexible and configurable. You can pass a custom configuration object to the `getSnappySDK` function.

```typescript
const snappy = getSnappySDK({
  // Custom configuration options
});
```

```typescript
interface SnappyConfig {
    registryUrl?: string; // The URL of the registry to use, defaults to the public registry
    defaultDomains?: string[]; // The default domains to use if the registry is not available
    debug?: boolean; // Whether to enable debug mode
    retryAttempts?: number; // The number of retry attempts to make when fetching domains
    retryDelay?: number; // The delay between retry attempts in milliseconds
}
```

