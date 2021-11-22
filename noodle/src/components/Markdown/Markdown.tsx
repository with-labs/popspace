import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography } from '@material-ui/core';
import { Link } from '../Link/Link';
import gfm from 'remark-gfm';

export interface IMarkdownProps {
  children: string;
}

// there's a 0 position h1 just in case - not a typo!
const headingLevels = ['h1', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

const renderers = {
  heading: ({ level, children }: any) => (
    <Typography gutterBottom variant={headingLevels[level] as any}>
      {children}
    </Typography>
  ),
  paragraph: ({ children }: any) => <Typography variant="body1">{children}</Typography>,
  link: ({ href, children }: any) => (
    <Link to={href} newTab>
      {children}
    </Link>
  ),
};

/**
 * Renders Markdown with our typography styles applied
 */
export const Markdown: React.FC<IMarkdownProps> = ({ children }) => {
  return (
    <ReactMarkdown renderers={renderers} plugins={[[gfm]]}>
      {children}
    </ReactMarkdown>
  );
};
