import React, { useRef } from 'react';
import clsx from 'clsx';
import './index.css';

// todo: update types
type SuggestionProps = {
  buttonSrc: any;
  buttonAltText: string;
  classNames?: string;
  onButtonClickHandler?: Function;
};

const Suggestion = (props: SuggestionProps) => {
  const { buttonSrc, buttonAltText, classNames, onButtonClickHandler } = props;

  const suggestionRef = useRef<HTMLDivElement>(null);

  const onButtonClick = () => {
    if (onButtonClickHandler) {
      onButtonClickHandler();
    }
  };

  return (
    <div ref={suggestionRef} className={clsx('Suggestion', classNames)}>
      <div className="Suggestion-button" onClick={onButtonClick}>
        {<img src={buttonSrc} alt={buttonAltText} />}
      </div>
    </div>
  );
};

export default Suggestion;
