import { useSelector } from 'react-redux';
import { propertySet, propertiesSet, propertyUnset } from '../../withComponents/RoomMetaProvider/roomMetaReducer';
import { RootState } from '../../withComponents/RoomState/store';
import { useRoomStateContext } from '../useRoomStateContext/useRoomStateContext';

export function useRoomMetaContext() {
  const properties = useSelector((state: RootState) => state.properties);
  const { dispatch } = useRoomStateContext();

  // Mutator to set a property
  const setProperty = (key: string, value: string) => {
    dispatch(propertySet(key, value));
  };

  const setProperties = (props: { [key: string]: string }) => {
    dispatch(propertiesSet(props));
  };

  // Mutator to unset a property
  const unsetProperty = (key: string) => {
    dispatch(propertyUnset(key));
  };

  return {
    properties,
    setProperty,
    setProperties,
    unsetProperty,
  };
}
