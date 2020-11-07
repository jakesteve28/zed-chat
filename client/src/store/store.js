import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import conversationsReducer from '../currentConversation/conversationsSlice'
import accountReducer from '../account/accountSettingsSlice'
import inviteReducer from '../topbar/inviteSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationsReducer,
    account: accountReducer,
    invite: inviteReducer
  },
});