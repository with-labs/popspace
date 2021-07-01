import React, { useEffect, useMemo, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import Sharedb from 'sharedb/lib/client';
import richText from 'rich-text';
import ReconnectingWebSocket from 'reconnecting-websocket';

Sharedb.types.register(richText.type);

const quillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      { font: [] },
      'bold',
      'italic',
      'underline',
      'strike',
      { header: [1, 2, 3, 4, 5, 6, false] },
      { color: [] },
      { background: [] },
      { align: [] },
      'blockquote',
      'code-block',
      // 'clean',
      { list: 'ordered' },
      { list: 'bullet' },
    ],
  },
  placeholder: 'Type here!',
};

/**
  @param {Object} props
  @param {string} props.docId
  @param {string} props.docCollection
  @param {string} props.id
  @param {WebSocket | undefined} props.socket
  @param {React.Component | undefined} props.spinner
  @param {React.RefObject | undefined} props.quillRef
  @param {string} props.userDisplayName
  @param {number} props.width
  @param {number} props.height
  @param {string} props.host
  @param {Object} props.initialData
*/
const CollaborativeQuill = (props) => {
  const [socketReady, setSocketReady] = useState(false);
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  const ready = socketReady && subscribed;

  // use either the passed-in socket connection or create a new one
  // with host details
  const socket = useMemo(
    () =>
      props.socket ||
      new ReconnectingWebSocket(props.host, [], {
        debug: false,
      }),
    [props.socket, props.host]
  );

  // subscribe to socket connection state
  useEffect(() => {
    const onSocketClose = () => setSocketReady(false);
    const onSocketOpen = () => setSocketReady(true);
    socket.addEventListener('close', onSocketClose);
    socket.addEventListener('open', onSocketOpen);

    return () => {
      socket.removeEventListener('close', onSocketClose);
      socket.removeEventListener('open', onSocketOpen);
    };
  }, [socket]);

  /* connect Sharedb to the server socket

     On reconnecting the socket to sharedb:
     https://github.com/share/sharedb/issues/121

     This is particularly useful:
     https://github.com/share/sharedb/issues/121#issuecomment-302754314
  */
  const connection = useMemo(() => new Sharedb.Connection(socket), [socket]);

  // fetch the document for the given info
  const doc = useMemo(
    () => connection.get(props.docCollection, props.docId),
    [connection, props.docCollection, props.docId]
  );

  const [quill, setQuill] = useState(null);
  // needs to be instantiated after the first render
  // so that the div referenced by the ID has time to mount
  useEffect(() => {
    const q = new Quill(`#${props.id}`, quillOptions);
    if (props.quillRef) {
      props.quillRef.current = q;
    }
    setQuill(q);
  }, [props.id, props.quillRef]);

  useEffect(() => {
    if (!quill) return;

    const onDocSubscribe = (error) => {
      if (error) {
        setError(error);
        return console.error('Error subscribing', error);
      }
      setSubscribed(true);

      // If doc.type is undefined, the document has not been created yet
      if (!doc.type) {
        doc.create(
          props.initialData || [{ insert: '' }],
          'rich-text',
          (error) => {
            if (error) {
              /*
              TODO: it's possible this would be triggered if multiple clients race to create the doc.
              I haven't tried to deliberately trigger and iron out that case, but so far things have worked.
              If it does happen, we could find a way to wait for document creation on non-owner clients.
              One way is to just avoid even notifying them the widget is added until it's been fully initialized.
              Another way is to be smart in this create somehow - but when we don't create, we need to wait for
              the doc to be initialized. The dumb solution is an active poll, but ideally there would be some
              event that the component can react to.
            */
              console.error(error);
            }
            quill.setContents(doc.data);
          }
        );
      } else {
        quill.setContents(doc.data);
        /*
          Otherwise, undoing will erase everything after load
          https://stackoverflow.com/questions/59653962/stop-undo-from-clearing-everything-in-the-editor-quill-quilljs
        */
        quill.history.clear();
      }

      quill.on('text-change', (delta, oldDelta, source) => {
        if (source !== 'user') return;
        doc.submitOp(delta, { source: quill });
      });
      doc.on('op', (op, source) => {
        if (source === quill) return;
        quill.updateContents(op);
      });
    };
    doc.subscribe(onDocSubscribe);

    return () => {
      doc.unsubscribe(onDocSubscribe);
      connection.close();
      socket.close();
    };
  }, [quill, doc, props.initialData]);

  if (error) {
    console.error(error);
    return null;
  }

  const isEditorVisible = ready;
  const editorVisibility = isEditorVisible ? 'visible' : 'hidden';
  const spinnerVisibility = isEditorVisible ? 'hidden' : 'visible';

  return (
    <div
      style={{
        width: props.width,
        height: props.height,
        /*
          With quill's snow theme, the tool bar pushes the canvas down 41px.
          They are sized together in their container inside of quill (which is the <div id={props.id}> div),
          but the tool bar doesn't seem to consume its height from the parent.
          Manually pad things from the bottom to ensure correct scrolling in container of the editor.

          Fix proposed e.g. here https://stackoverflow.com/questions/57695124/how-to-resize-quill-editor-to-fit-inside-a-div

          Alternative?
          https://jsfiddle.net/pykm29bo/3/
        */
        paddingBottom: '41px',
      }}
      data-testid="root"
    >
      <div
        style={{
          visibility: spinnerVisibility,
          height: '0px',
        }}
        data-testid="spinner"
      >
        {props.spinner || <div />}
      </div>
      <style>
        {`.ql-container.ql-snow {
          border-style: none;
        }
        .ql-toolbar.ql-snow {
          border-bottom-width: 1px;
          border-left-width: 0px;
          border-right-width: 0px;
          border-top-width: 0px;
        }`}
      </style>
      <div style={{ visibility: editorVisibility }} data-testid="editor">
        {/*
        Quill may inject another div for the controls above itself.
        We want to make both invisible simultaneously,
        so we have to surround them with a div.
      */}
        <div
          style={{
            fontSize: props.fontSize || '18px',
          }}
          id={props.id}
          data-testid="editor-container"
        />
      </div>
    </div>
  );
};

export default CollaborativeQuill;
