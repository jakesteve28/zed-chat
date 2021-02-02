import { createSlice } from '@reduxjs/toolkit';

export const sidebarStates = {
    hidden: "hidden",
    show: "show",
    full: "full"
}

// export const backgroundColors = {
//     black: "#191919",
//     red: "",
//     blue: "",
//     green: "",
//     purple: "",
//     gray: "",
// }

// export const filters = {
//     red: "",
//     blue: "",
//     green: "",
//     purple: "",
//     gray: "",
//     clear: "",
//     opaque: ""
// }

// export const defaultAccountBackgroundURL = {
//     mthood: "",
//     mtsthelens: "",
//     mtadams: "",
//     mtrainier: "",
//     mtbaker: ""
// }

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarState: "hidden",
    topbarMessage: "",
    accountBackground: "",
    backgroundColor: "#191919",
    backgroundTint: "transparent",
    conversationBackground: "mthood"
  },
  reducers: {
    setSidebarState: (state, action) => {
        switch(action.payload){
            case action.payload === sidebarStates.hidden && state.sidebarState !== sidebarStates.hidden:
                state.sidebarState = sidebarStates.hidden;
                break ;
            case action.payload === sidebarStates.show && state.sidebarState !== sidebarStates.show:
                state.sidebarState = sidebarStates.show;
                break ;
            case action.payload === sidebarStates.full && state.sidebarState !== sidebarStates.full:
                state.sidebarState = sidebarStates.full;
                break ;
            default: state.sidebarState = sidebarStates.show; break;
        }
    }, 
    setTopbarMessage: (state, action) => {
        state.topbarMessage = action.payload;
    },  
    setDefaultBackground: (state, action) => {
        state.defaultBackground = action.payload;
    },  
    setColor: (state, action) => {
        state.backgroundColor = action.payload;
    }, 
    setTint: (state, action) => {
        state.backgroundTint = action.payload;
    }, 
    setConversationBackground: (state, action) => {
        state.conversationBackground = action.payload;
    }   
  }
});

export const { setSidebarState, setTopbarMessage, setDefaultBackground, setColor, setTint, setConversationBackground } = uiSlice.actions;

export const selectSidebarState = state => state.ui.sidebarState;
export const selectTopbarMessage = state => state.ui.topbarMessage;
export const selectAccountBackground = state => state.ui.accountBackground;
export const selectBackgroundColor = state => state.ui.backgroundColor;
export const selectBackgroundTint = state => state.ui.backgroundTint;
export const selectConversationBackground = state => state.ui.conversationBackground;

export default uiSlice.reducer;
