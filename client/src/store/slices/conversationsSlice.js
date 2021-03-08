import { createSlice } from '@reduxjs/toolkit';
import produce from 'immer'; 

export const conversationsSlice = createSlice({
  name: 'conversations',
  initialState: {
    conversations: [],
    currentConversation: { messages: [], joined: false, typing: false, id: 0 },
    defaultView: true,
    showConvList: false
  },
  reducers: {
    clearConversations: (state) => {
        state.conversations = [];
        state.currentConversation = { messages: [], joined: false, typing: false, id: 0 };
        state.defaultView = true;
        state.showConvList = false;
    },
    addConversation: (state, action) => {
        if(state.conversations.filter(conv => conv.id === action.payload.conversation.id).length  > 0) {
            console.log("Error: cannot add conversation because one already exists in store");
            return;
        }
        state.conversations.push(action.payload.conversation);
    },
    removeConversation: (state, action) => {
        state.conversations = state.conversations.filter((conv) => { return conv.id !== action.payload.id});
    },
    setCurrentConversation: (state, action) => {
        if(!action.payload){
            state.currentConversation = { messages: [], joined: false, typing: false, id: 0 };
            return;
        } 
        if(state.conversations.filter(conv => conv.id === action.payload.conversation.id).length < 1) {
            console.log("Error: cannot set current conversation to a conversation that doesn't exist in the store");
            return;
        }
        state.currentConversation = action.payload.conversation;
    },
    addMessage: (state, action) => {
        const convs = produce(state.conversations, () => {});
        for(let conv of convs){
            if(conv.id === action.payload.conversation.id){
                if(!Array.isArray(conv.messages)){
                    console.log("Messages don't exist yet");
                    conv.messages = [];
                    conv.messages.push(action.payload.message);
                    if(conv.numberOfMessages < conv.messages.length) {
                        conv.numberOfMessages = conv.messages.length;
                    }
                    break; 
                }
                if(conv.messages.filter(msg => msg.id === action.payload.message.id).length > 0) {
                    console.log("Error: Cannot add message because it already exists in the state!");
                    break;
                }
                if(conv.id === state.currentConversation.id){
                    if(!Array.isArray(state.currentConversation.messages) || !state.currentConversation.messages) {
                        state.currentConversation.messages = []
                    } 
                    state.currentConversation.messages.push(action.payload.message);
                    if(state.currentConversation.numberOfMessages <  state.currentConversation.messages.length) {
                        state.currentConversation.numberOfMessages =  state.currentConversation.messages.length;
                    }
                    break;
                }
                if(Array.isArray(conv.messages)){
                    conv.messages.push(action.payload.message);
                    if(conv.numberOfMessages < conv.messages.length) {
                        conv.numberOfMessages = conv.messages.length;
                    }
                    break;
                }
            }
        }
        state.conversations = produce(convs, () => {});
    },
    removeMessage: (state, action) => {
        const { conversationId, messageId } = action.payload;
        if(state.currentConversation === conversationId) {
            state.currentConversation.messages = state.currentConversation.messages.filter(msg => msg.id !== messageId);
        } 
        for(let conv of state?.conversations) {
            if(conv.id === conversationId){
                conv.messages = conv.messages.filter(msg => msg.id !== messageId); 
            }
        }
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
    },
    sortMessages: (state) => {
        if(state.currentConversation.messages.length > 1) 
            state.currentConversation.messages.sort((a, b) =>  Date.parse(a.createdAt) - Date.parse(b.createdAt));
    },
    pinMessage: (state, action) => {
        for(let conv of state.conversations) {
            if(action.payload.conversation.id === conv.id) {
                for(let msg of conv.messages) {
                    if(msg.id === action.payload.id){
                        msg.pinned = action.payload.pinned;
                    }
                }
            }
        }
    },
    batchAddMessages: (state, action) => {
        const { messages, conversationId } = action.payload; 
        for(let message of messages) {
            if(message.conversation.id === state.currentConversation.id && 
                state.currentConversation.id === conversationId) {
                state.currentConversation.messages.push(message); 
                if(state.currentConversation.numberOfMessages <  state.currentConversation.messages.length) {
                    state.currentConversation.numberOfMessages =  state.currentConversation.messages.length;
                }
            } 
        }
    }
  }
});

export const { batchAddMessages, removeMessage, sortMessages, setShowConvList, clearConversations, setView, setTyping, setRead, setJoined, addMessage, setCurrentConversation, addConversation, removeConversation, pinMessage } = conversationsSlice.actions;

export const selectConversations = state => state.conversations.conversations;
export const selectCurrentConversation = state => state.conversations.currentConversation;
export const selectJoined = state => state.conversations.currentConversation.joined;
export const selectTyping = state => state.conversations.currentConversation.typing;
export const selectView = state => state.conversations.defaultView;
export const selectShowConvList = state => state.conversations.showConvList;

export default conversationsSlice.reducer;
