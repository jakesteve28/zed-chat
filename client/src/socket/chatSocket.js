import React, { useEffect } from 'react';
import io from "socket.io-client";
import { selectAccount } from '../account/accountSettingsSlice';
import { selectToken } from '../auth/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { selectHost } from '../store/store';
import {
addMessage,
selectConversations,
selectCurrentConversation,
setTyping,
setRead
} from '../currentConversation/conversationsSlice';

import {
    selectFriends
} from '../account/friendsSlice';

import {  toast } from 'react-toastify';

let chatSocket = null;

const socketEvents = {
    received: {
        connectSuccess: "connectSuccess",
        connectError: "connectError",
        delivered: "delivered",
        deliveryError: "deliveryError",
        readReceipt: "readReceipt",
        typing: "typing",
        listening: "listening",
        unlistened: "unlistened",
        unlistenError: "unlistenError",
        currentConversationUpdate: "currentConversationUpdate",
        setCurrentConversationError: "setCurrentConversationError",
        refreshSuccess: "refreshSuccess",
        refreshError: "refreshError"
    },
    sent: {
        connect: "connect",
        disconnect: "disconnect",
        chatToServer: "chatToServer",
        readMessage: "readMessage",
        typing: "typing",
        listen: "listen",
        unlisten: "unlisten",
        setCurrentConversation: "setCurrentConversation",
    }
}

export default function ChatSocket(){
    const account = useSelector(selectAccount);
    let currentConversation = useSelector(selectCurrentConversation);
    const token = useSelector(selectToken);
    const conversations = useSelector(selectConversations);
    const dispatch = useDispatch();
    const host = useSelector(selectHost);
    const friends = useSelector(selectFriends);

    const listenAllRooms = (chatSocket) => {
        console.log("Listening to all rooms", conversations)
        if(conversations && Array.isArray(conversations)){
            for(let conv of conversations){
                if(conv && conv.id && conv.pending === false){
                    console.log("listening to conversation", conv);
                    chatSocket.emit(socketEvents.sent.listen, { room: conv.id, user: account.id });
                }
            }
        } else {
            //conversations = single conversation aka current one
            chatSocket.emit(socketEvents.sent.listen, { room: currentConversation.id, user: account.id });
        }
    } 
    
    const teardownEventListeners = (chatSocket) => {
        if(chatSocket == null || !chatSocket){
            return true;
        }
        for(let key in socketEvents.received){
            chatSocket.off(socketEvents.received[key]);
        }
    }

    useEffect(() => {
        if(currentConversation && currentConversation.id && token && account && currentConversation.id !== "0"){
            const socketOptions = {
                transportOptions: {
                    polling: {
                        extraHeaders: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                },
                forceNew: true
            }
            console.log("Setting up chat socket");
            chatSocket = io.connect(`${host}/chat`, socketOptions);
            console.log("Setting up chat socket event listeners and listening to rooms");
            console.log("Setting up listeners");
            chatSocket.on(socketEvents.received.listening, (msg) => {
                console.log(`Successfully listening on room with ID ${msg.room}`)
            })
            chatSocket.on(socketEvents.received.connectSuccess, (msg) => {
                console.log(`Connected to socket.io server successfully with client id ${msg.socketId}`);
            });
            chatSocket.on(socketEvents.received.connectError, (msg) => {
                console.log(`Error: Cannot connect to socket.io server | ${msg.message}`);
            });
            chatSocket.on(socketEvents.received.delivered, (msg) => {
                console.log(`Handle message | ${msg.message.id} | delivered`);
                if(account.id !== msg.message.user.id && msg.message.conversation.id !== currentConversation.id){
                    //On another screen and received a message, pop up a toast
                    toast.info(`Message received from: ${msg.message.user.tagName}` , { position: "top-center", hideProgressBar: true, pauseOnHover: true} );
                }
                if(msg.message.id && msg.message.body && msg.message.createdAt){
                    console.log(`Adding message to state ... | ${msg.message.id}`);
                    dispatch(addMessage({ message: msg.message, conversation: msg.message.conversation }));
                }
            });
            chatSocket.on(socketEvents.received.deliveryError, () => {
                console.log("Error: server error while marking message as delivered");
            });
            chatSocket.on(socketEvents.received.readReceipt, (msg) => {
                console.log(`Handle message | ${msg.message.id} | read receipt`);
                if(msg.message.id && msg.message.body && msg.message.createdAt){
                    //Is the message valid? ... Just checking properties....
                    //Can probably use typescript interfaces eventually once I add ts transpiler to build scripts
                    console.log(`Adding message read receipt to state ... | ${msg.message.id}`);
                    dispatch(setRead({ messageId: msg.message.id, convId: msg.message.conversation.id }));
                }
            });
            chatSocket.on(socketEvents.received.typing, (msg) => {
                console.log(`Handle typing event conversation | ${msg.conv}`);
                if(msg.conv && msg.user){
                    if(msg.user.id === account.id){
                        //Is the sender of this event equal to myself?
                        //Return void okay?
                        return;
                    }
                    if(currentConversation.id === msg.conv){
                        //If msg.typing is null for whatever reason || false
                        dispatch(setTyping(msg.typing || false));
                    }
                }
            });
            chatSocket.on(socketEvents.received.unlistened, (msg) => {
                console.log(`Handle unlisten event for conversation | ${msg.room}`);
            });
            chatSocket.on(socketEvents.received.unlistenError, (msg) => {
                console.log(`Error: unlisten event error for conversation | ${msg.msg}`);
            });
            chatSocket.on(socketEvents.received.currentConversationUpdate, (msg) => {
                console.log(`Handle current conversation update event for user | ${msg.user.tagName}`);
                if(msg.user){
                    let friend = friends.filter(el => el.id === msg.user.id)[0];
                    if(friend){
                        console.log(`Handle set current conversation for friend @${msg.user.tagName}`);
                        friend = msg.user;
                    }
                }
            });
            chatSocket.on(socketEvents.received.setCurrentConversationError, (msg) => {
                console.log(`Error: set current conversation event error | ${msg.msg}`);
            }); 
            chatSocket.on(socketEvents.received.refreshSuccess, (msg) => {
                console.log(`Handle success refresh socket client ID with server ${msg.clientId}`);
            });
            chatSocket.on(socketEvents.received.refreshError, (msg) => {
                console.log(`Handle error for refresh socket client ID with server error ${msg.msg}`);
            });
            listenAllRooms(chatSocket);
            chatSocket.emit('refresh', { userId: account.id, refresh: true });
        } else {
            chatSocket = null;
        }
        return () => {
            if(chatSocket) {
                Object.keys(socketEvents.received).map(el => chatSocket.off(el));
                chatSocket.close();
                chatSocket = null;
            }
        }
    }, [currentConversation.id]);
    return (<></>);
}

export { chatSocket }