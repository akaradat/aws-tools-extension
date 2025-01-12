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
  add: (item: CloudwatchLogItem) => Promise<void>;
  init: () => Promise<void>;
  clear: () => Promise<void>;
};

const storage = createStorage<CloudwatchLogItem[]>('cloudwatch-item', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const cloudwatchItemStorage: CloudwatchItemStorage = {
  ...storage,
  add: async (item: CloudwatchLogItem) => {
    await storage.set(items => [...items, item]);
  },
  init: async () => {
    await storage.set([
      {
        name: 'SNS create statement',
        lambda: 'tcrb-ob-statement-createStatement',
      },
      {
        lambda: 'tcrb-mb-biz-transfer-TransferRequestFunction',
      },
      {
        lambda: 'tcrb-mb-biz-authen-ExistsQRFunction',
        api: '/v1/authen/ekyc/signup-status',
      },
      {
        gatewayName: 'mb-biz-backend',
        gatewayId: 'a4db3j',
        stage: 'api',
      },
      {
        gatewayName: 'mb-backend',
        gatewayId: 'jklf8g2',
        stage: 'api',
      },
    ]);
  },
  clear: async () => {
    await storage.set([]);
  },
};
