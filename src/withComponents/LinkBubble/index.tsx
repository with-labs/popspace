import React from 'react';
import './index.css';

import linkImg from './images/link.svg';
import exitIcon from './images/emoji_OUT.svg';

type LinkBubbleProps = {
  url: string;
  userName: string;
  onCloseHandler: Function;
};

const LinkBubble = ({ url, userName, onCloseHandler }: LinkBubbleProps) => {
  return (
    <div className="LinkBubble">
      <div
        className="LinkBubble-closeBtn"
        onClick={() => {
          onCloseHandler && onCloseHandler();
        }}
      >
        <img className="LinkBubble-closeBtnIcon" src={exitIcon} alt="close link icon" />
      </div>
      <div className="LinkBubble-content">
        <div>
          <img className="LinkBubble-img" src={linkImg} alt="link-img" />
        </div>
        <div>{userName}</div>
        <div>has posted</div>
        <div>
          <a className="LinkBubble-link" href={url} target="_blank" rel="noopener noreferrer">
            a link
          </a>
        </div>
      </div>
    </div>
  );
};

export default LinkBubble;
