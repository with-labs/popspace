/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import { makeStyles, Tooltip, Box, Typography } from '@material-ui/core';
import * as React from 'react';
import { Link } from '../../../../../components/Link/Link';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetContent } from '../../WidgetContent';
import { WidgetTitlebar } from '../../WidgetTitlebar';
import { LinkMenu } from '../menu/LinkMenu';
import { useCanvasObject } from '../../../../../providers/canvas/CanvasObject';
import { DEFAULT_IFRAME, LINK_SUMMARY_WIDTH, SIZE_STUB, WIDGET_TITLE_HEIGHT } from '../constants';
import { ClassNameMap } from '@material-ui/styles';
import { FileIcon } from '../FileIcon';
import { CanvasObjectDragHandle } from '../../../../../providers/canvas/CanvasObjectDragHandle';

const useStyles = makeStyles((theme) => ({
  menu: {
    marginLeft: theme.spacing(2),
    flexShrink: 0,
  },
  iframeContainer: {
    width: '100%',
    height: '100%',
  },
  iframe: {
    border: 'none',
  },
  clamp: {
    overflow: 'hidden',
    display: 'box',
    'line-clamp': 3,
    'box-orient': 'vertical',
    color: theme.palette.brandColors.slate.ink,
  },
  noUnderlineHover: {
    '&:hover': {
      'text-decoration': 'None',
    },
    '&:hover #url': {
      'text-decoration': 'Underline',
    },
  },
  label: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  linkWrapper: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    overflow: 'hidden',
  },
  icon: {
    flexShrink: 0,
  },
}));

/**
 * This handler attempts to stop a ctrl/cmd + wheel event
 * over the iframe from reaching the iframe and causing page
 * zoom. It's passed to the capture-phase wheel event handler
 * so it has a chance to run before the event reaches the iframe
 * from the top of the document.
 */
const stopIframeZoomEvent = (ev: React.WheelEvent) => {
  if (ev.ctrlKey || ev.metaKey) {
    ev.preventDefault();
    ev.stopPropagation();
  }
};

type linkSummaryProps = {
  name: string;
  url: string;
  description: string;
  thumbUrl: string;
  content: React.MutableRefObject<HTMLInputElement>;
  classes: ClassNameMap;
};

const LinkSummary = ({ name, url, description, thumbUrl, content, classes }: linkSummaryProps) => (
  <Tooltip title={name} placement="bottom">
    <Box
      ref={content}
      flexDirection="column"
      alignItems="flex-start"
      alignContent="flex-start"
      flex={1}
      component={Link}
      overflow="hidden"
      className={classes.noUnderlineHover}
      {...({ href: url, newTab: true } as any)}
    >
      <Box p={2} flex={1} display="flex" flexDirection="column" width={LINK_SUMMARY_WIDTH}>
        <Typography variant="h2">{name}</Typography>
        <Typography id="url" variant="body1">
          {url}
        </Typography>
        <Typography className={classes.clamp} variant="body2">
          {description}
        </Typography>
      </Box>
      {thumbUrl !== '' && (
        <Box flex={1} display="flex">
          <img src={thumbUrl} width={LINK_SUMMARY_WIDTH} />
        </Box>
      )}
    </Box>
  </Tooltip>
);

export function IFrameDocumentContent({
  disableSandbox,
  data,
  goodResponse,
}: {
  disableSandbox?: boolean;
  data: {
    providerName: string;
    title: string;
    html: string;
    url: string;
    description: string;
    providerUrl: string;
    thumbnailUrl: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    type: string;
  };
  goodResponse?: boolean;
}) {
  let embed = <></>;
  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  const classes = useStyles();
  const { t } = useTranslation();

  const [loadIFrame, setLoadIFrame] = React.useState(false);
  const content = React.useRef() as React.MutableRefObject<HTMLInputElement>;
  const { resize } = useCanvasObject();
  const iFrameUrl = !data.html ? widgetState.iframeUrl : '';

  //handling widget resize after rendering the iframe or custom embed
  React.useEffect(() => {
    if (content.current) {
      if (!goodResponse) {
        resize({ width: SIZE_STUB.width, height: SIZE_STUB.height });
      } else if (!data.html && !iFrameUrl) {
        const ratio = data.thumbnailHeight / data.thumbnailWidth;
        const contentHeight =
          content.current.getElementsByTagName('div').length !== 0
            ? content.current.getElementsByTagName('div')[0].offsetHeight
            : 0;
        const imageHeight = !!ratio ? LINK_SUMMARY_WIDTH * ratio : 0;
        const height = contentHeight + imageHeight + WIDGET_TITLE_HEIGHT;
        resize({ width: LINK_SUMMARY_WIDTH, height: height }, true);
      } else {
        if (content.current.getElementsByTagName('iframe').length !== 0) {
          //resize iframes
          resize(
            {
              width: content.current.getElementsByTagName('iframe')[0].offsetWidth,
              height: content.current.getElementsByTagName('iframe')[0].offsetHeight + WIDGET_TITLE_HEIGHT,
            },
            true
          );
        } else {
          //special case where the embed is not an iframe, i.e. tweets
          resize({ width: DEFAULT_IFRAME.width, height: DEFAULT_IFRAME.height }, true);
        }
      }
    }
  }, [loadIFrame, embed, data, iFrameUrl, resize]);

  //create the embed depending on the response from embedly API
  if (!goodResponse) {
    return (
      <CanvasObjectDragHandle>
        <WidgetContent disablePadding>
          <div className={classes.linkWrapper} ref={content}>
            <Tooltip title={widgetState.url} placement="bottom">
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                flex={1}
                component={Link}
                overflow="hidden"
                {...({ href: widgetState.url, newTab: true } as any)}
              >
                <FileIcon state={widgetState} className={classes.icon} />
                <Box ml={2} flex={1} display="flex" flexDirection="column" overflow="hidden">
                  <Typography variant="h3" component="span" className={classes.label}>
                    {widgetState.title}
                  </Typography>
                  <Typography variant="caption" className={classes.label}>
                    {widgetState.url}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
            <LinkMenu className={classes.menu} />
          </div>
        </WidgetContent>
      </CanvasObjectDragHandle>
    );
  } else if (!data.html && !iFrameUrl) {
    embed = (
      <LinkSummary
        name={data.providerName}
        url={data.providerUrl}
        description={data.description}
        thumbUrl={data.thumbnailUrl}
        content={content}
        classes={classes}
      />
    );
  } else {
    embed = (
      <div className={classes.iframeContainer} onWheelCapture={stopIframeZoomEvent} ref={content}>
        {!!data.html ? (
          <div
            dangerouslySetInnerHTML={{ __html: data.html }}
            onLoad={() => {
              setLoadIFrame(true);
            }}
          />
        ) : (
          <iframe
            src={iFrameUrl ?? widgetState.url}
            title={widgetState.title}
            style={{ minWidth: DEFAULT_IFRAME.width, minHeight: DEFAULT_IFRAME.height, height: '100%', width: '100%' }}
            allow="encrypted-media"
            allowFullScreen
            allowTransparency
            sandbox={disableSandbox ? undefined : 'allow-presentation allow-scripts allow-same-origin allow-forms'}
            className={classes.iframe}
            onLoad={() => {
              setLoadIFrame(true);
            }}
          />
        )}
      </div>
    );
  }
  return (
    <>
      <WidgetTitlebar title={data.title ?? t('widgets.link.embedTitle')} disableRemove>
        <LinkMenu />
      </WidgetTitlebar>
      <WidgetContent disablePadding>{embed}</WidgetContent>
    </>
  );
}
