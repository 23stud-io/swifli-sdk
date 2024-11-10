import { SwifliTwitterSDK } from './core/sdk';

import { SwifliConfig } from './core/types';
export type { 
  SwifliConfig, 
  TweetMatch, 
  SwifliEventMap 
} from './core/types';
export { UIComponents } from './ui/components';

export const getSwifliSDK = (config?: SwifliConfig) => SwifliTwitterSDK.getInstance(config);