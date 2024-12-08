import { SnappyTwitterSDK } from './core/sdk';

import { SnappyConfig } from './core/types';
export type { 
  SnappyConfig, 
  TweetMatch, 
  SnappyEventMap 
} from './core/types';
export { UIComponents } from './ui/components';

export const getSnappySDK = (config?: SnappyConfig) => SnappyTwitterSDK.getInstance(config);