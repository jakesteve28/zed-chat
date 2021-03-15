import { createSlice } from '@reduxjs/toolkit';

export const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    friendRequests: []
  },
  reducers: {
    clearFriends: (state) => {
       state.friendRequests = []
       state.friends = []
    },
    addFriend: (state, action) => {
        if(state.friends.filter(friend => friend.id === action.payload.id || friend.tagName === action.payload.tagName).length > 0){
            return;
        }
        if(action.payload.password) delete action.payload.password;  
        state.friends = [...state.friends, action.payload]
    },
    removeFriend: (state, action) => {
        state.friends = state.friends.filter(el => el.id !== action.payload);
    },
    addFriendRequest: (state, action) => {
        if(state.friendRequests.filter(req => req.id === action.payload.id).length > 0){
          return;
        }
        state.friendRequests = [...state.friendRequests, action.payload];
    },
    removeFriendRequest: (state, action) => {
        state.friendRequests = state.friendRequests.filter(el => el.id !== action.payload);
    },
    declineRequest: (state, action) => {
      const request = state.friendRequests.filter(el => el.id === action.payload)[0];
      if(request)
        request.cancelled = true;
    },
    acceptRequest: (state, action) => {
      const index = state.friendRequests.findIndex(frreq => frreq.id === action.payload);
      if(index !== -1) {
        state.friendRequests[index].accepted = true;
      }
    },
    updateFriend: (state, action) => {
      const index = state.friends.findIndex(fr => fr.id === action.payload.friend.id); 
      if(index !== -1) {
        state.friends[index] = action.payload.friend;
      }
    }
  }
});

export const { updateFriend, clearFriends, addFriend, removeFriend, addFriendRequest, removeFriendRequest, declineRequest, acceptRequest } = friendsSlice.actions;

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
export const selectFriends = state => state.friends.friends;

export const selectFriendRequests = state => state.friends.friendRequests;

export default friendsSlice.reducer;
