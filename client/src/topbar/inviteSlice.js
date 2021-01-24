import { createSlice } from '@reduxjs/toolkit';

export const inviteSlice = createSlice({
  name: 'invite',
  initialState: {
    sentInvites: [],
    receivedInvites: [],
    acceptedInvites: []
  },
  reducers: {
    clearInvites: (state) => {
        state.sentInvites = []
        state.receivedInvites = []
        state.acceptedInvites = []
    },
    addSentInvite: (state, action) => {
        state.sentInvites.push(action.payload)
    },
    addReceivedInvite: (state, action) => {
        state.receivedInvites.push(action.payload)
    },
    removeSentInvite: (state, action) => {
        state.sentInvites = state.sentInvites.filter(el => el.id !== action.payload)
    },
    removeReceivedInvite: (state, action) => {
        state.receivedInvites = state.receivedInvites.filter(el => el.id !== action.payload)
    },
    addAcceptedInvite: (state, action) => {
        state.acceptedInvites.push(action.payload)
    }
  },
});

export const { clearInvites, addSentInvite, addReceivedInvite, removeSentInvite, removeReceivedInvite, addAcceptedInvite } = inviteSlice.actions;

// // The function below is called a thunk and allows us to perform async logic. It
// // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// // will call the thunk with the `dispatch` function as the first argument. Async
// // code can then be executed and other actions can be dispatched
// export const incrementAsync = amount => dispatch => {
//   setTimeout(() => {
//     dispatch(incrementByAmount(amount));
//   }, 1000);
// };

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectSent = state => state.invite.sentInvites;
export const selectReceived = state => state.invite.receivedInvites;
export const acceptedInvites = state => state.invite.acceptedInvites;

export default inviteSlice.reducer;
