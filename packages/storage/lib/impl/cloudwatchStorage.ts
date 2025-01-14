import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

export type CloudwatchLogLambdaItem = {
  name?: string;
  lambda: string;
};

export type CloudwatchLogApiItem = {
  api: string;
  lambda: string;
};

export type CloudwatchLogGatewayItem = {
  gatewayName: string;
  gatewayId: string;
  stage: string;
};

export type CloudwatchLogItem = CloudwatchLogLambdaItem | CloudwatchLogApiItem | CloudwatchLogGatewayItem;

type CloudwatchItemStorage = BaseStorage<CloudwatchLogItem[]> & {
  add: (items: CloudwatchLogItem[]) => Promise<void>;
  clear: () => Promise<void>;
};

const storage = createStorage<CloudwatchLogItem[]>('cloudwatch-item', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const cloudwatchItemStorage: CloudwatchItemStorage = {
  ...storage,
  add: async (newItems: CloudwatchLogItem[]) => {
    await storage.set(items => [...items, ...newItems]);
  },
  clear: async () => {
    await storage.set([]);
  },
};
