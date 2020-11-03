import React, { useState } from 'react';
import { ResizeContainer, useResizeContext } from './ResizeContainer';
import { Bounds } from '../../types/spatials';
import { ResizeHandle } from './ResizeHandle';
import { withViewport } from '../../stories/__decorators__/withViewport';
import { Button } from '@material-ui/core';
import palette from '../../theme/palette';
import image from '../../images/avatars/greenparrot.png';

export default {
  title: 'components/ResizeContainer',
  component: ResizeContainer,
  argTypes: {},
  decorators: [withViewport],
};

const Big = () => (
  <div
    style={{
      width: 500,
      height: 500,
      background: palette.mandarin.light,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  ></div>
);
const Small = () => (
  <div
    style={{
      width: 200,
      height: 200,
      background: palette.oregano.light,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  ></div>
);

const ToggleAndRemeasureButton = ({ toggleSrc }: { toggleSrc: () => void }) => {
  const { remeasure } = useResizeContext();

  const onClick = () => {
    toggleSrc();
    remeasure();
  };

  return (
    <Button style={{ position: 'absolute', left: 4, top: 4 }} fullWidth={false} onClick={onClick} size="small">
      Switch content
    </Button>
  );
};

export const FreeSizing = () => {
  const [size, setSize] = useState<Bounds | null>(null);
  const [src, setSrc] = useState<'big' | 'small'>('big');

  const toggleSrc = () => {
    setSrc((cur) => (cur === 'big' ? 'small' : 'big'));
  };

  return (
    <ResizeContainer size={size} onResize={setSize} minWidth={200} minHeight={200}>
      <div
        style={{ position: 'relative', border: '1px solid blue', width: '100%', height: '100%', overflow: 'hidden' }}
      >
        {src === 'big' ? <Big /> : <Small />}
        <ToggleAndRemeasureButton toggleSrc={toggleSrc} />
        <ResizeHandle style={{ position: 'absolute', bottom: 8, right: 8, color: 'black' }} />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {size?.width} x {size?.height}
        </div>
      </div>
    </ResizeContainer>
  );
};

export const ScaleSizing = () => {
  const [size, setSize] = useState<Bounds | null>(null);

  return (
    <ResizeContainer size={size} onResize={setSize} minWidth={200} minHeight={200} mode="scale">
      <div
        style={{ position: 'relative', border: '1px solid blue', width: '100%', height: '100%', overflow: 'hidden' }}
      >
        <img src={image} style={{ width: '100%' }} alt="" />
        <ResizeHandle style={{ position: 'absolute', bottom: 8, right: 8, color: 'black' }} />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {size?.width} x {size?.height}
        </div>
      </div>
    </ResizeContainer>
  );
};
