jest.mock('reconnecting-websocket');
jest.mock('sharedb/lib/client');
jest.mock('quill');

import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import CollaborativeQuill from '../src/collaborative_quill';
import ReconnectingWebsocket from 'reconnecting-websocket';
import { mockConnection, mockDocument } from '../__mocks__/sharedb/lib/client';
import { mockInstance as mockWebsocket } from '../__mocks__/reconnecting-websocket';
import Quill from 'quill';

describe('CollaborativeQuill component', () => {
  test('connects to the server with the document ID and collection', () => {
    const result = render(
      <CollaborativeQuill
        docId="doc1"
        docCollection="documents"
        host="wss://fake-host.com"
        id="some-id"
      />,
    );

    expect(ReconnectingWebsocket).toHaveBeenCalledTimes(1);
    expect(mockConnection.get).toHaveBeenCalledWith('documents', 'doc1');

    result.rerender(
      <CollaborativeQuill
        docId="doc2"
        docCollection="documents"
        host="wss://fake-host.com"
        id="some-id"
      />,
    );

    // host didn't change, socket stays connected
    expect(ReconnectingWebsocket).toHaveBeenCalledTimes(1);
    expect(mockConnection.get).toHaveBeenCalledWith('documents', 'doc2');
  });

  test('constructs Quill after first render with the main element id', async () => {
    const result = render(
      <CollaborativeQuill
        docId="doc1"
        docCollection="documents"
        host="wss://fake-host.com"
        id="some-id"
      />
    );

    expect(Quill).toHaveBeenCalledWith('#some-id', expect.anything());
  })

  test('doesn\'t render visible content until document is subscribed', async () => {
    // setup mocks to simulate socket connection
    let onOpen;
    mockWebsocket.addEventListener.mockImplementation((eventName, callback) => {
      // capture open callback
      if (eventName === 'open') {
        onOpen = callback;
      }
    });

    // setup mocks to simulate document lifecycle
    let documentSubscribe;
    mockDocument.subscribe.mockImplementation(callback => {
      // capture callback
      documentSubscribe = callback;
    });

    const result = render(
      <CollaborativeQuill
        docId="doc1"
        docCollection="documents"
        host="wss://fake-host.com"
        id="some-id"
      />
    );

    const spinner = result.getByTestId('spinner');
    const editor = result.getByTestId('editor');

    // still loading
    expect(spinner.style.visibility).toBe('visible');
    expect(editor.style.visibility).toBe('hidden');

    act(() => {
      // invoke the socket connection callback
      onOpen();
    });

    // still loading
    expect(spinner.style.visibility).toBe('visible');
    expect(editor.style.visibility).toBe('hidden');

    act(() => {
      // invoke the subscribe callback
      documentSubscribe(null);
    });

    // after subscription is complete, the component is updated
    // to show the editor.
    await waitFor(() => {
      expect(editor.style.visibility).toBe('visible');
    })
  })
});
