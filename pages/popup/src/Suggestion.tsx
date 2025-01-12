import '@src/Suggestion.css';
import React, { useState } from 'react';
import type { ChangeEvent, SuggestionSelectedEventData, SuggestionsFetchRequestedParams } from 'react-autosuggest';
import Autosuggest from 'react-autosuggest';
import type { CloudwatchLogItem } from '@extension/shared';
import { withErrorBoundary, withSuspense } from '@extension/shared';

// const impr = {
//   action: 'import:cloudwatch',
//   data: [
//     {
//       lambda: 'tcrb-mb-biz-authen-ExistsQRFunction',
//       api: '/v1/authen/ekyc/signup-status',
//     },
//     {
//       gatewayName: 'biz-backend',
//       gatewayId: 'a4db3j',
//       stage: 'api',
//     },
//   ],
// };

const logList: CloudwatchLogItem[] = [
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
    gatewayName: 'biz-backend',
    gatewayId: 'a4db3j',
    stage: 'api',
  },
];

const getSuggestions = (value: string): CloudwatchLogItem[] => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? []
    : logList.filter(log => {
        if ('name' in log && !!log.name && log.name.includes(inputValue)) {
          return true;
        }

        if ('lambda' in log && !!log.lambda && log.lambda.includes(inputValue)) {
          return true;
        }

        if ('api' in log && !!log.api && log.api.includes(inputValue)) {
          return true;
        }

        if ('gatewayName' in log && !!log.gatewayName && log.gatewayName.includes(inputValue)) {
          return true;
        }

        if ('gatewayId' in log && !!log.gatewayId && log.gatewayId.includes(inputValue)) {
          return true;
        }

        return false;
      });
};

const renderSuggestion = (suggestion: CloudwatchLogItem) => {
  const lines = [];

  if ('name' in suggestion && !!suggestion.name) {
    lines.push({ kind: 'Name', label: suggestion.name });
  }

  if ('api' in suggestion && !!suggestion.api) {
    lines.push({ kind: 'API', label: suggestion.api });
  }

  if ('lambda' in suggestion && !!suggestion.lambda) {
    lines.push({ kind: 'Lambda', label: suggestion.lambda });
  }

  if ('gatewayName' in suggestion && !!suggestion.gatewayName) {
    lines.push({ kind: 'Gateway', label: suggestion.gatewayName });
  }

  return (
    <div>
      {lines.map(({ kind, label }, index) => (
        <React.Fragment key={index}>
          {!!index && <br />}
          <b>{kind}:</b>&nbsp;{label}
        </React.Fragment>
      ))}
    </div>
  );
};

export type OnValueChangeType = (value: CloudwatchLogItem | string) => void;

const Suggestion = ({ onValueChange }: { onValueChange: OnValueChangeType }) => {
  const [suggestions, setSuggestions] = useState<CloudwatchLogItem[]>([]);
  const [value, setValue] = useState('');

  const getSuggestionValue = (suggestion: CloudwatchLogItem) => {
    if ('name' in suggestion && !!suggestion.name) {
      return suggestion.name;
    }

    if ('api' in suggestion && !!suggestion.api) {
      return suggestion.api;
    }

    if ('lambda' in suggestion && !!suggestion.lambda) {
      return suggestion.lambda;
    }

    if ('gatewayId' in suggestion && !!suggestion.gatewayId) {
      return suggestion.gatewayName;
    }

    return '';
  };

  const onSuggestionsFetchRequested = ({ value }: SuggestionsFetchRequestedParams) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onChange = (_event: React.FormEvent<HTMLElement>, { newValue }: ChangeEvent) => {
    setValue(newValue);
    onValueChange(newValue);
  };

  const onSuggestionSelected = (
    _event: React.FormEvent<HTMLElement>,
    data: SuggestionSelectedEventData<CloudwatchLogItem>,
  ) => {
    onValueChange(data.suggestion);
  };

  return (
    <>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={{
          placeholder: 'Function Name',
          value: value,
          onChange,
          id: 'lambda_function_name',
        }}
      />
    </>
  );
};

export default withErrorBoundary(withSuspense(Suggestion, <div> Loading ... </div>), <div> Error Occur </div>);
