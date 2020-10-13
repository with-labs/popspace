import { reducer, actions, initialState, selectors } from './roomSlice';
import { WidgetType } from '../../types/room';

describe('redux roomSlice state', () => {
  it('enforces boundaries on object movement', () => {
    const createAction = actions.addWidget({
      position: { x: 0, y: 0 },
      widget: {
        kind: 'widget',
        type: WidgetType.Link,
        data: {
          title: 'foo',
          url: 'bar',
        },
        isDraft: false,
        participantSid: 'a',
      },
    });
    const todo = [
      createAction,
      actions.moveObject({
        id: createAction.payload.widget.id,
        // out of bounds
        position: { x: 2000, y: 2000 },
      }),
    ];

    const result = todo.reduce(reducer, initialState);

    expect(
      selectors.createPositionSelector(createAction.payload.widget.id)({
        room: result,
      } as any)
    ).toEqual({
      x: 1250,
      y: 1250,
    });
  });
});
