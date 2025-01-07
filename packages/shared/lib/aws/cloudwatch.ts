type Mapping = {
  [key: string]: string;
};

export type CloudWatchInfo = {
  region: string;
  logName: string;
  streamName?: string;
  query?: CloudWatchQuery;
};

export type CloudWatchQuery = {
  start?: number;
  end?: number;
  filterPattern?: string;
};

const DECODE_MAPPING: Mapping = {
  $3F: '?',
  $3D: '=',
  $26: '&',
  $252F: '/',
  $255B: '[',
  $255D: ']',
  $2522: '"',
};

const ENCODE_MAPPING = Object.entries(DECODE_MAPPING).reduce((acc, [key, value]) => {
  acc[value] = key;

  return acc;
}, {} as Mapping);

function encode(str: string): string {
  const regex = new RegExp(
    `[${Object.keys(ENCODE_MAPPING)
      .map(key => key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
      .join('')}]`,
    'g',
  );

  return str.replace(regex, match => ENCODE_MAPPING[match] || match);
}

function decode(str: string): string {
  const regex = new RegExp(
    Object.keys(DECODE_MAPPING)
      .map(key => key.replace(/\$/g, '\\$')) // Escape $
      .join('|'),
    'g',
  );

  return str.replace(regex, match => DECODE_MAPPING[match] || match);
}

export function getLogNameFromLambdaFunctionName(functionName: string) {
  return `/aws/lambda/${functionName}`;
}

export function getLogNameFromApiGatewayId(apiId: string, stage: string) {
  return `API-Gateway-Execution-Logs_${apiId}/${stage}`;
}

function createQueryString(query: CloudWatchQuery): string {
  const parts = [];

  if (query.start) {
    parts.push(`start=${query.start}`);
  }
  if (query.end) {
    parts.push(`end=${query.end}`);
  }
  if (query.filterPattern) {
    const filterPattern = query.filterPattern.replace(/ /g, '+');
    parts.push(`filterPattern=${filterPattern}`);
  }

  const queryString = parts.join('&');
  return queryString ? `?${queryString}` : '';
}

export function checkIsCloudWatchUrl(url: string): boolean {
  return url.includes('console.aws.amazon.com/cloudwatch/home');
}

export function getUrlFromCloudWatchInfo({ region, logName, streamName, query }: CloudWatchInfo): string {
  const encodedFunctionName = encode(logName);
  const queryParams = createQueryString(query || {});
  const encodedQueryParams = encode(queryParams); // including ?
  const streamPath = streamName ? `/${encode(streamName)}` : '';

  return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/${encodedFunctionName}/log-events${streamPath}${encodedQueryParams}`;
}

export function getCloudWatchInfoFromUrl(url: string): CloudWatchInfo {
  const urlObj = new URL(url);

  const domain = urlObj.hostname; // "ap-southeast-1.console.aws.amazon.com"

  if (!domain.includes('console.aws.amazon.com')) {
    return { region: '', logName: '' };
  }

  const region = domain.replace('.console.aws.amazon.com', '');

  const hash = urlObj.hash;
  if (!hash) {
    return { region, logName: '' };
  }

  const hashParts = hash.split('/');
  const encodedLogName = hashParts[2];
  const logName = decode(encodedLogName);

  const pathWithQueryString = decode(hashParts[hashParts.length - 1]);
  const parts = pathWithQueryString.split('?');
  let streamName;
  if (parts[0] !== 'log-events') {
    streamName = parts[0];
  }

  const queryString = parts[1] || '';

  const params = new URLSearchParams(queryString);

  const start = params.get('start');
  const end = params.get('end');
  const filterPattern = params.get('filterPattern');

  const result: CloudWatchInfo = {
    region,
    logName,
    query: {
      start: start ? parseInt(start, 10) : undefined,
      end: end ? parseInt(end, 10) : undefined,
      filterPattern: filterPattern || undefined,
    },
  };

  if (streamName) {
    result.streamName = streamName;
  }

  return result;
}
