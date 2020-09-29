import React from 'react';
import clsx from 'clsx';
import { TwoColLayout } from '../../../Layouts/TwoColLayout/TwoColLayout';
import { Button } from '@material-ui/core';
import styles from './GenericErrorPage.module.css';

interface IGenericErrorPageProps {
  buttonText: string;
  onClick: () => void;
  quoteText: string;
  title: string;
  body: string;
  errorMessage?: string;
  img: React.ReactNode;
}

export const GenericErrorPage: React.FC<IGenericErrorPageProps> = (props) => {
  const { buttonText, onClick, quoteText, title, body, errorMessage, img } = props;

  const errorCol = (
    <div className={clsx(styles.container, '')}>
      <div>{quoteText}</div>
      <div className="u-fontH0">{title}</div>
      <div className={clsx(styles.body, 'u-fontP1')}>{body}</div>
      <div className={clsx(styles.error, 'u-fontP1')}>{errorMessage}</div>
      <Button className={styles.button} onClick={onClick}>
        {buttonText}
      </Button>
    </div>
  );
  return (
    <main className="u-flex u-height100Percent u-flexCol">
      <TwoColLayout
        left={errorCol}
        right={img}
        leftColClassNames="u-flexJustifyCenter u-flexAlignItemsCenter"
        rightColClassNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone"
      />
    </main>
  );
};
