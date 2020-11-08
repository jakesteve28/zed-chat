import { createSlice } from '@reduxjs/toolkit';

export const conversationsSlice = createSlice({
  name: 'conversations',
  initialState: {
    conversations: [],
    currentConversation: { joined: false, typing: false },
    defaultView: true
  },
  reducers: {
    clearConversations: (state, action) => {
        state.conversations = [];
        state.currentConversation = { joined: false, typing: false };
        state.defaultView = true;
    },
    addConversation: (state, action) => {
        state.conversations.push(action.payload.conversation)
    },
    removeConversation: (state, action) => {
        state.conversations = state.conversations.filter((conv) => { return conv.id !== action.payload.id})
    },
    setCurrentConversation: (state, action) => {
        state.currentConversation = action.payload
    },
    addMessage: (state, action) => {
        const convs = JSON.parse(JSON.stringify(state.conversations)) 
        for(let conv of convs){
            if(conv.id === action.payload.conversation.id){
                conv.messages.push(action.payload.message)
                state.currentConversation = conv
            }
        }
        state.conversations = JSON.parse(JSON.stringify(convs))
    },
    sendToCurrent: (state, action) => {
        state.currentConversation.messages.push(action.payload)
    },
    setJoined: (state, action) => {
        state.currentConversation.joined = action.payload
    },
    setRead: (state, action) => {
        state.currentConversation.messages[action.payload.index].read = true
    },
    setTyping: (state, action) => {
        state.currentConversation.typing = action.payload
    },
    setView: (state, action) => {
        state.defaultView = action.payload
    }
  }
});

export const { clearConversations, setView, setTyping, setRead, setJoined ,addMessage, setCurrentConversation, addConversation, removeConversation } = conversationsSlice.actions;

export const selectConversations = state => state.conversations.conversations;
export const selectCurrentConversation = state => state.conversations.currentConversation;
export const selectJoined = state => state.conversations.currentConversation.joined;
export const selectTyping = state => state.conversations.currentConversation.typing;
export const selectView = state => state.conversations.defaultView;

export default conversationsSlice.reducer;
