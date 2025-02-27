import '@src/Suggestion.css';
import React, { useEffect, useState } from 'react';
import type { ChangeEvent, SuggestionSelectedEventData, SuggestionsFetchRequestedParams } from 'react-autosuggest';
import Autosuggest from 'react-autosuggest';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import type { CloudwatchLogItem } from '@extension/storage';
import { cloudwatchItemStorage } from '@extension/storage';

const escapeRegex = (x: string): string => {
  return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getSuggestions = (list: CloudwatchLogItem[], value: string): CloudwatchLogItem[] => {
  const searchRgx = new RegExp([...value.trim().toLowerCase()].map(escapeRegex).join('.*'), 'i');

  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? []
    : list.filter(log => {
        if ('name' in log && !!log.name && searchRgx.test(log.name.toLowerCase())) {
          return true;
        }

        if ('lambda' in log && !!log.lambda && searchRgx.test(log.lambda.toLowerCase())) {
          return true;
        }

        if ('api' in log && !!log.api && searchRgx.test(log.api.toLowerCase())) {
          return true;
        }

        if ('gatewayName' in log && !!log.gatewayName && searchRgx.test(log.gatewayName.toLowerCase())) {
          return true;
        }

        if ('gatewayId' in log && !!log.gatewayId && searchRgx.test(log.gatewayId.toLowerCase())) {
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

export type OnValueChangeType = (value: CloudwatchLogItem | string) => void;

const Suggestion = ({ onValueChange }: { onValueChange: OnValueChangeType }) => {
  useEffect(() => {
    document.getElementById('lambda_function_name')?.focus();
  }, []);

  const logList = useStorage(cloudwatchItemStorage);

  const [suggestions, setSuggestions] = useState<CloudwatchLogItem[]>([]);
  const [value, setValue] = useState('');

  const onSuggestionsFetchRequested = ({ value }: SuggestionsFetchRequestedParams) => {
    setSuggestions(getSuggestions(logList, value));
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
