import { createSlice } from '@reduxjs/toolkit';

export const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    friendRequests: []
  },
  reducers: {
    clearFriends: (state, action) => {
       state.friendRequests = []
       state.friends = []
    },
    addFriend: (state, action) => {
        state.friends = [...state.friends, action.payload]
    },
    removeFriend: (state, action) => {
        state.friends = state.friends.filter(el => el.id !== action.payload)
    },
    addFriendRequest: (state, action) => {
        state.friendRequests = [...state.friendRequests, action.payload]
    },
    removeFriendRequest: (state, action) => {
        state.friendRequests = state.friendRequests.filter(el => el.id !== action.payload)
    }
  },
});

export const { clearFriends, addFriend, removeFriend, addFriendRequest, removeFriendRequest } = friendsSlice.actions;

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
export const selectFriends = state => {
    return state.friends.friends
};

export const selectFriendRequests = state => {
     return state.friends.friendRequests
};

export default friendsSlice.reducer;
