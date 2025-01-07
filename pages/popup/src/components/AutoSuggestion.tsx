import React, { useState } from 'react';
import type { SuggestionsFetchRequestedParams, ChangeEvent as AutosuggestChangeEvent } from 'react-autosuggest';
import Autosuggest from 'react-autosuggest';

interface Language {
  name: string;
  year: number;
}

const languages: Language[] = [
  {
    name: 'arkar',
    year: 1972,
  },
  {
    name: 'Elm',
    year: 2012,
  },
];

function getSuggestions(value: string): Language[] {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? []
    : languages.filter(lang => lang.name.toLowerCase().slice(0, inputLength) === inputValue);
}

function AutoSuggestComponent() {
  const [value, setValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Language[]>([]);

  const onChange = (event: React.FormEvent<HTMLElement>, { newValue }: AutosuggestChangeEvent) => {
    setValue(newValue);
  };

  const onSuggestionsFetchRequested = ({ value }: SuggestionsFetchRequestedParams) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const inputProps = {
    placeholder: 'Type a programming language',
    value,
    onChange,
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={(suggestion: Language) => suggestion.name}
      renderSuggestion={(suggestion: Language) => <div>{suggestion.name}</div>}
      inputProps={inputProps}
    />
  );
}

export default AutoSuggestComponent;
