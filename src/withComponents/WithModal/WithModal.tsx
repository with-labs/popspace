import React, { MouseEvent, ReactNode } from 'react';
import clsx from 'clsx';
import Modal from 'react-modal';
import { ReactComponent as BackGlyph } from '../../images/glyphs/back.svg';
import styles from './WithModal.module.css';

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

interface IWithModal {
  title?: string;
  children?: ReactNode;
  isOpen: boolean;
  onCloseHandler?: (e: MouseEvent) => void;
  className?: string;
}

export const WithModal: React.FC<IWithModal> = ({ title, children, isOpen, onCloseHandler, className }) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Modal
        isOpen={isOpen}
        onRequestClose={onCloseHandler}
        overlayClassName=""
        className={clsx(styles.content, 'u-sm-sizeFull u-flex u-flexCol', className)}
        closeTimeoutMS={200}
      >
        {title ? (
          <h2
            className={clsx(styles.title, 'u-fontP1 u-flex u-flexAlignItemsCenter u-cursorPointer u-marginBottom40')}
            onClick={onCloseHandler}
          >
            {onCloseHandler ? <BackGlyph /> : null}
            {title}
          </h2>
        ) : null}
        {children}
      </Modal>
    </div>
  );
};
