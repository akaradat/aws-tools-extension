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
