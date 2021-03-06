import { SET_LOCAL_PANELS } from '../constants';

const localPanelsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_LOCAL_PANELS:
      return Object.assign({}, state, action.dat);
    default:
  }
  return state;
};

export default localPanelsReducer;
