import * as React from 'react';
import { WidgetType } from '../../../../../roomState/types/widgets';
import { useWidgetContext } from '../../useWidgetContext';
import { WidgetResizeContainer } from '../../WidgetResizeContainer';
import { WidgetFrame } from '../../WidgetFrame';
import { IFrameDocumentContent } from './IFrameDocumentContent';
import { CollapsedDocumentContent } from './CollapsedDocumentContent';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  resizeContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export function DocumentLinkWidget() {
  const classes = useStyles();

  const {
    widget: { widgetState },
  } = useWidgetContext<WidgetType.Link>();

  return (
    <WidgetFrame color="snow">
      <WidgetResizeContainer
        mode="free"
        minWidth={340}
        minHeight={80}
        maxWidth={1440}
        maxHeight={900}
        className={classes.resizeContainer}
      >
        {widgetState.showIframe ? <IFrameDocumentContent /> : <CollapsedDocumentContent />}
      </WidgetResizeContainer>
    </WidgetFrame>
  );
}
