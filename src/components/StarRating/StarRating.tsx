import { Spacing } from '@components/Spacing/Spacing';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { HTMLAttributes, KeyboardEvent, useState } from 'react';

export interface StarRatingProps {
  value: number;
  onChange: (newValue: number) => void;
  className?: string;
  id?: string;
  onBlur?: (ev: any) => void;
}

const useStyles = makeStyles(() => ({
  root: {
    cursor: 'pointer',
    '&:focus': {
      outline: 'none',
    },
  },
}));

export function StarRating({ value, onChange, className, id, onBlur: providedOnBlur, ...rest }: StarRatingProps) {
  const classes = useStyles();

  const [hovered, setHovered] = useState(-1);

  const onFocus = () => {
    setHovered(value);
  };

  const onBlur = (ev: any) => {
    onChange(hovered);
    setHovered(-1);
    providedOnBlur?.(ev);
  };

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'ArrowLeft') {
      const newValue = Math.max(0, hovered - 1);
      setHovered(newValue);
    } else if (ev.key === 'ArrowRight') {
      const newValue = Math.min(4, hovered + 1);
      setHovered(newValue);
    } else if (ev.key === 'Enter') {
      onChange(hovered);
    }
  };

  return (
    <Spacing
      onPointerLeave={() => setHovered(-1)}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      className={clsx(classes.root, className)}
      aria-activedescendant={`star-${hovered}`}
      {...rest}
    >
      {[0, 1, 2, 3, 4].map((starValue) => (
        <StarRatingButton
          pending={hovered >= starValue}
          selected={hovered === -1 ? value >= starValue : hovered >= starValue}
          onPointerEnter={() => setHovered(starValue)}
          onClick={() => onChange(starValue)}
          id={`star-${starValue}`}
        />
      ))}
    </Spacing>
  );
}

const useButtonStyles = makeStyles(() => ({
  root: {
    transition: 'transform 0.3s cubic-bezier(0.270, -0.315, 0.520, 1.650), fill 0.2s ease-in',
    stroke: '#ffcd64',
    fill: 'transparent',
  },
  pending: {
    transform: 'scale(1.2)',
  },
  selected: {
    fill: '#ffcd64',
  },
}));

function StarRatingButton({
  pending,
  selected,
  className,
  ...rest
}: HTMLAttributes<SVGElement> & { pending: boolean; selected: boolean }) {
  const classes = useButtonStyles();

  return (
    <svg
      width="42"
      height="40"
      viewBox="0 0 42 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(
        classes.root,
        {
          [classes.pending]: pending,
          [classes.selected]: selected,
        },
        className
      )}
      {...rest}
    >
      <path
        d="M19.3905 3.08415C20.0853 1.81009 21.9147 1.81009 22.6095 3.08414L26.7137 10.6096C27.4088 11.8842 28.6402 12.7789 30.0673 13.0461L38.4927 14.6239C39.9191 14.891 40.4844 16.6309 39.4874 17.6854L33.5986 23.9142C32.6011 24.9692 32.1307 26.4168 32.3176 27.8567L33.4206 36.3572C33.6073 37.7963 32.1273 38.8716 30.8163 38.2493L23.0727 34.5735L22.4294 35.9285L23.0727 34.5735C21.761 33.9508 20.239 33.9508 18.9273 34.5735L11.1837 38.2493C9.87267 38.8716 8.39266 37.7963 8.5794 36.3572L9.68242 27.8566C9.86925 26.4168 9.39891 24.9692 8.40143 23.9142L2.51258 17.6854C1.51559 16.6309 2.08091 14.891 3.50732 14.6239L11.9327 13.0461C13.3598 12.7789 14.5912 11.8842 15.2863 10.6096L19.3905 3.08415Z"
        stroke="inherit"
        fill="inherit"
        stroke-width="3"
      />
    </svg>
  );
}
