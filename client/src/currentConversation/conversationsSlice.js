import { createSlice } from '@reduxjs/toolkit';

export const conversationsSlice = createSlice({
  name: 'conversations',
  initialState: {
    conversations: [],
    currentConversation: { messages: [], joined: false, typing: false, id: 0 },
    defaultView: true,
    showConvList: false
  },
  reducers: {
    clearConversations: (state, action) => {
        state.conversations = [];
        state.currentConversation = { messages: [], joined: false, typing: false };
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
                if(!conv.messages) conv.messages = []
                conv.messages.push(action.payload.message)
                if(conv.id === state.currentConversation.id){
                    if(!Array.isArray(state.currentConversation.messages) || !state.currentConversation.messages) {
                        state.currentConversation.messages = []
                    } state.currentConversation.messages.push(action.payload.message)
                }
                //state.currentConversation = conv
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
        const conv = state.conversations.filter(el => el.id === action.payload.convId)[0];
        if(conv){
            const message = conv.messages.filter(el => el.id === action.payload.messageId)[0];
            if(message){
                message.read = true;
            }
        }
    },
    setTyping: (state, action) => {
        state.currentConversation.typing = action.payload
    },
    setView: (state, action) => {
        state.defaultView = action.payload
    },
    setShowConvList: (state, action) => {
        state.showConvList = action.payload
    }
  }
});

export const { setShowConvList, clearConversations, setView, setTyping, setRead, setJoined ,addMessage, setCurrentConversation, addConversation, removeConversation } = conversationsSlice.actions;

export const selectConversations = state => state.conversations.conversations;
export const selectCurrentConversation = state => state.conversations.currentConversation;
export const selectJoined = state => state.conversations.currentConversation.joined;
export const selectTyping = state => state.conversations.currentConversation.typing;
export const selectView = state => state.conversations.defaultView;
export const selectShowConvList = state => state.conversations.showConvList;

export default conversationsSlice.reducer;
