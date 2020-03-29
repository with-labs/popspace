import React from 'react';
import clsx from 'clsx';
import './index.css';

type FooterProps = {
  classNames?: string;
};

const Footer = ({ classNames }: FooterProps) => {
  return <footer className={clsx('Footer', classNames)}></footer>;
};

export default Footer;
