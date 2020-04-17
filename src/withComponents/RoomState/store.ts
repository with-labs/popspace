import { combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import huddles from '../HuddleProvider/huddleReducer';
import widgets from '../WidgetProvider/widgetReducer';
import participantMeta from '../ParticipantMetaProvider/participantMetaReducer';
import properties from '../RoomMetaProvider/roomMetaReducer';

const appReducer = combineReducers({ huddles, widgets, participantMeta, properties });

// This is a technique to replace the state of the Redux store state as seen here:
// https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store/35641992#35641992
// On a PING, we want to replace the state, since that will be like the initial state for a newly entered participant.
// @ts-ignore
const rootReducer = (state, action) => {
  if (action.type === 'PING') {
    return action.payload.state;
  }

  return appReducer(state, action);
};

const store = createStore(rootReducer, {}, composeWithDevTools());

export default store;
