import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { toast, useToaster } from 'react-hot-toast';
import { ToastType } from 'react-hot-toast/dist/core/types';

// @ts-ignore
window.toast = toast;

const toastTypeMap: Record<ToastType, 'error' | 'success' | 'info' | 'warning'> = {
  success: 'success',
  error: 'error',
  loading: 'info',
  blank: 'info',
  custom: 'info',
};

// offset the height of the bottom bar to avoid collision
const globalOffset = 80;

export const Toaster: React.FC = () => {
  const {
    toasts,
    handlers: { startPause, endPause, calculateOffset, updateHeight },
  } = useToaster({ duration: 15 * 1000 });

  return (
    <>
      {toasts.slice(0, 2).map((toast) => {
        const offset = calculateOffset(toast, {
          gutter: 32,
          reverseOrder: false,
        });

        const ref = (el: HTMLElement) => {
          if (el && !toast.height) {
            const height = el.getBoundingClientRect().height;
            updateHeight(toast.id, height);
          }
        };

        const children = typeof toast.message === 'function' ? toast.message(toast) : toast.message;

        return (
          <Snackbar
            open={toast.visible}
            onMouseEnter={startPause}
            onMouseLeave={endPause}
            style={{
              transform: `translate(-50%, -${offset + globalOffset}px)`,
              transition: 'transform 0.12s ease-out',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            key={toast.id}
          >
            <Alert severity={toastTypeMap[toast.type]} {...toast.ariaProps} ref={ref}>
              {children}
            </Alert>
          </Snackbar>
        );
      })}
    </>
  );
};
