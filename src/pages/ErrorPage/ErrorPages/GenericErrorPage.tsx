import React from 'react';
import clsx from 'clsx';
import { TwoColLayout } from '../../../Layouts/TwoColLayout/TwoColLayout';
import { Column } from '../../../Layouts/TwoColLayout/Column/Column';

import { Button } from '@material-ui/core';
import styles from './GenericErrorPage.module.css';

interface IGenericErrorPageProps {
  buttonText: string;
  onClick: () => void;
  quoteText: string;
  title: string;
  body: string;
  errorMessage?: string;
  imgSrc?: string;
  imgAltText?: string;
}

export const GenericErrorPage: React.FC<IGenericErrorPageProps> = (props) => {
  const { buttonText, onClick, quoteText, title, body, errorMessage, imgSrc, imgAltText } = props;

  return (
    <main className={clsx(styles.root, 'u-flex u-flexCol')}>
      <TwoColLayout>
        <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter" useColMargin={true}>
          <div className={styles.container}>
            <div>{quoteText}</div>
            <div className="u-fontH0">{title}</div>
            <div className={clsx(styles.body, 'u-fontP1')}>{body}</div>
            <div className={clsx(styles.error, 'u-fontP1')}>{errorMessage}</div>
            <Button className={styles.button} onClick={onClick}>
              {buttonText}
            </Button>
          </div>
        </Column>
        {imgSrc && imgAltText ? (
          <Column classNames="u-flexJustifyCenter u-flexAlignItemsCenter u-sm-displayNone">
            <div className={styles.imageContainer}>
              <img className={styles.image} src={imgSrc} alt={imgAltText} />
            </div>
          </Column>
        ) : null}
      </TwoColLayout>
    </main>
  );
};
