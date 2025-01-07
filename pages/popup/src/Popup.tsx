import '@src/Popup.css';
import React, { useEffect, useState } from 'react';
import type { CloudWatchInfo } from '@extension/shared';
import {
  getCloudWatchInfoFromUrl,
  getLogNameFromLambdaFunctionName,
  getUrlFromCloudWatchInfo,
  withErrorBoundary,
  withSuspense,
} from '@extension/shared';

const Popup = () => {
  const [isContainFilter, setIsContainFilter] = useState(false);
  const [cloudWatchInfo, setCloudWatchInfo] = useState<CloudWatchInfo | null>(null);

  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length > 0 && tabs[0].url) {
          const currentUrl = tabs[0].url;
          const isCloudWatchUrl = getCloudWatchInfoFromUrl(currentUrl);

          if (!isCloudWatchUrl) {
            setIsContainFilter(false);
            return;
          }

          const info = getCloudWatchInfoFromUrl(currentUrl);
          console.log(info);
          console.log(info.query?.start || info.query?.end || info.query?.filterPattern);
          setCloudWatchInfo(info);

          if (info.query?.start || info.query?.end || info.query?.filterPattern) {
            setIsContainFilter(true);
            return;
          }

          setIsContainFilter(false);
        }
      });

    document.getElementById('lambda_function_name')?.focus();
  }, []);

  const onClickOpen = (isWithFilter: boolean = false) => {
    return (e: React.SyntheticEvent<HTMLButtonElement>) => {
      e.preventDefault();

      const elem = document.getElementById('lambda_function_name') as HTMLInputElement;

      const lambdaFunctionName = elem.value;
      if (!lambdaFunctionName) {
        return;
      }

      const logName = getLogNameFromLambdaFunctionName(lambdaFunctionName);

      const options: CloudWatchInfo = {
        region: cloudWatchInfo?.region || 'ap-southeast-1',
        logName,
      };

      if (isWithFilter) {
        options.query = {
          start: cloudWatchInfo?.query?.start,
          end: cloudWatchInfo?.query?.end,
          // not support filterPattern for now. will be added in the future after have setting
          // filterPattern: cloudWatchInfo?.query?.filterPattern,
        };
      }

      const newUrl = getUrlFromCloudWatchInfo(options);
      chrome.tabs.create({ url: newUrl });
    };
  };

  return (
    <div className="w-96 max-w-md border-2 border-black bg-white p-4">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">CloudWatch Log Opener</h3>
      <div className="mt-4">
        <form>
          <label htmlFor="lambda_function_name" className="mb-2 block text-sm font-medium ">
            Lambda Function name
          </label>
          <input
            type="text"
            id="lambda_function_name"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm"
            placeholder="function-name"
            autoComplete="off"
            required
          />
          <button
            type="submit"
            name="action"
            value="normal"
            onClick={onClickOpen(false)}
            className="mt-4 w-full rounded border border-orange-500 px-4 py-2 font-bold text-orange-500 hover:bg-orange-700 hover:text-white">
            Open
          </button>
          {isContainFilter && (
            <button
              type="submit"
              name="action"
              value="with_filter"
              onClick={onClickOpen(true)}
              className="mt-2 w-full rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-700">
              Open With Filter
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
