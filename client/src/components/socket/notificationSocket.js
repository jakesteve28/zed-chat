import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import { useSelector, useDispatch } from 'react-redux';
import {
addConversation,
removeConversation,
selectConversations
} from '../../store/slices/conversationsSlice';
import {
addFriend,
removeFriend,
addFriendRequest,
selectFriends,
declineRequest,
acceptRequest,
selectFriendRequests
} from '../../store/slices/friendsSlice';
import { selectAccount } from '../../store/slices/accountSettingsSlice';
import { addReceivedInvite, addSentInvite, removeAcceptedInvite, removeReceivedInvite, removeSentInvite, selectReceived, selectSent } from '../../store/slices/inviteSlice';
import { toast } from 'react-toastify';
import { selectHost } from '../../store/store';

let notificationSocket = null;

const socketEvents = {
    received: {
        connectSuccess: "connectSuccess",
        connectError: "connectError",
        inviteReceived: "inviteReceived",
        inviteSent: "inviteSent",
        inviteSentError: "inviteSentError",
        acceptedInvite: "acceptedInvite",
        acceptInviteError: "acceptInviteError",
        friendRequestSent: "friendRequestSent",
        friendRequestSentError: "friendRequestSentError",
        friendRequestDeclined: "friendRequestDeclined",
        friendRequestDeclinedError: "friendRequestDeclinedError",
        friendAdded: "friendAdded",
        acceptFriendRequestError: "acceptFriendRequestError",
        friendRemoved: "friendRemoved",
        friendRemovedError: "friendRemovedError",
        refreshNotificationSuccess: "refreshNotificationSuccess",
        inviteDeclined: "inviteDeclined"
    },
    sent: {
        connect: "connect",
        disconnect: "disconnect",
        sendInvite: "sendInvite",
        acceptInvite: "acceptInvite",
        sendFriendRequest: "sendFriendRequest",
        declineFriendRequest: "declineFriendRequest",
        acceptFriendRequest: "acceptFriendRequest",
        removeFriend: "removeFriend",
    }
}

const idExists = (id, collection) => {
    let res = false;
    if(collection && Array.isArray(collection)){
        for(let el of collection){
            if(el.id === id){
                res = true
                break;
            }
        }
    }
    return res;
}

const inviteExists = (id, invites) => {
    return idExists(id, invites);
}

const friendExists = (id, friends) => {
    return idExists(id, friends);
}

const requestExists = (id, requests) => {
    return requests.some(req => req.id === id); 
}

const setupEventListeners = (notificationSocket, dispatch, account, friends, requests, conversations, sentInvites, receivedInvites) => {
    //After passing an enormous amount of shit, this function sets up the notification socket.
    //I need to refactor this, document. I pulled it out of the "notifications socket" component below... 
    //TODO
    notificationSocket.on(socketEvents.received.connectSuccess, (msg) => {
        console.log(`Successfully connected to notifications namespace with client ID | ${msg.clientId}`);
    });

    notificationSocket.on(socketEvents.received.connectError, (msg) => {
        console.log(`Error: cannot connect to notifications namespace... error from server | ${msg.err}`);
    });

    notificationSocket.on(socketEvents.received.inviteReceived, (msg) => {
        try {
            console.log(`Handle invite received from user @${msg.user.tagName}`);
            if(inviteExists(msg.invite.id, receivedInvites)){
                console.log(`Error: Invite already received with ID | ${msg.invite.id} |`);
                return;
            }
            if(msg.invite.recipientId === account.id && msg.conv){
                if(conversations){ //Conversations list exists in state
                    if(0 === conversations.filter(el => el.id === msg.invite.conversationId).length){
                        //conversations list doesn't contain the invite's conversation ID, so length is 0
                        //Probably a better way to do this...
                        //So basically, add a new invite/conversation 
                        dispatch(addConversation({ conversation: msg.conv }));
                        msg.invite.sender = msg.user;
                        //Set the sender to the received user
                        dispatch(addReceivedInvite(msg.invite));
                        console.log(`Handle invite received successfully from user @${msg.user.tagName} for new conversation ${msg.conv.id}`);
                        toast.info(`Invite received from: @${msg.invite.user.tagName}` , { position: "top-center", hideProgressBar: true, pauseOnHover: true, style: { opacity: 0.7 }} );
                    }
                }
            } 
        } catch(err) {
            console.log(`Error: Handle invite received error | ${err}`);
        }
    });

    notificationSocket.on(socketEvents.received.inviteSent, (msg) => {
        try {
            console.log(`Handle invite successfully sent event for conversation ${msg.conv.id}`);
            if(inviteExists(msg.invite.id, sentInvites)){
                console.log(`Error: Invite already sent with ID | ${msg.invite.id} |`);
                return;
            }
            if(msg && msg.conv && msg.invite){
                dispatch(addSentInvite(msg.invite));
                console.log(`Invite | ${msg.invite.id} | for conversation | ${msg.conv.id} | saved and successfully added to state`);
                toast.info(`Invite successfully sent!` , { position: "top-center", hideProgressBar: true, pauseOnHover: true, style: { opacity: 0.7 }});
            } else {
                throw `Error: Invite sent data received from the server is malformed | ${msg}`;
            }
        } catch(err) {
            console.log("Error with sending invite from server", err);
        }
    });

    notificationSocket.on(socketEvents.received.acceptedInvite, (msg) => {
        console.log(`Handle conversation invite accepted by user ID | ${msg.invite.recipientId}`); 
        if(msg.conv && msg.invite && msg.invite.senderId === account.id){
            //Event from server, with NOT pending conversation object, emitted to the sender of the conversation invite
            console.log(`Setting conversation with ID | ${msg.conv.id} | to not pending for sender`); 
            dispatch(removeConversation({ id: msg.conv.id }));
            dispatch(addConversation({ conversation: msg.conv }));
            dispatch(removeReceivedInvite(msg.invite.id)); 
            //if(user) toast.info(`Conversation Invite accepted by @${user.tagName}` , { position: "top-center", hideProgressBar: true, pauseOnHover: true,style: { opacity: 0.7 }} );
           // else console.log(`Error: friend with ID | ${msg.invite.senderId} | does not exist, cannot accept conversation!`, msg.invite, friends);
            return;
        } else if(msg.conv && msg.invite && msg.invite.recipientId === account.id){
            //Event from server, with NOT pending conversation object, emitted back to the recipient of the conversation invite after they accept
            console.log(`Setting conversation with ID | ${msg.conv.id} | to not pending`); 
            //dispatch(removeConversation({ id: msg.conv.id }));
            dispatch(addConversation({ conversation: msg.conv }));
            //if(msg.user) toast.info(`Conversation Invite accepted by @${user.tagName}` , { position: "top-center", hideProgressBar: true, pauseOnHover: true, style: { opacity: 0.7 }} );
           // else console.log(`Error: friend with ID | ${msg.invite.senderId} | does not exist, cannot accept conversation!`, msg.invite, friends);
            return;
        } else {
            console.log(`Error: accepted invite data from server incorrectly formatted!`, msg);
        }
    });    

    notificationSocket.on(socketEvents.received.friendRequestSent, (msg) => {
        console.log(`Handle friend request sent event`);
        if(msg && msg.friendRequest){
            const recipientId = msg.friendRequest.recipientId;
            const senderId = msg.friendRequest.senderId;
            if(recipientId === account.id){
                //Recipient of friend request
                dispatch(addFriendRequest(msg.friendRequest));
                toast.info(`Friend request received from user @${msg.friendRequest.senderTagname}`, { position: "top-center", hideProgressBar: true, pauseOnHover: true, style: { opacity: 0.7 }} );
                console.log(`Successfully received friend request with ID | ${msg.friendRequest.id} | and added to state`);
                return;
            } else if(senderId === account.id){
                //Sender of friend request
                //dispatch(addFriendRequest(msg.friendRequest));
                toast.info(`Successfully sent friend request to ${msg.friendRequest.recipientTagname}`,  { position: "top-center", hideProgressBar: true, pauseOnHover: true, style: { opacity: 0.7 }})
                console.log(`Successfully sent friend request with ID | ${msg.friendRequest.id} | and added to state`);
                return;
            } else {
                console.log(`Error: Friend request object does not contain a user with ID equal to this account!`, msg.friendRequest);
                return;
            }
        } else {
            console.log(`Error: malformed friend request sent event message object! ${msg}`);
            return;
        }
    });

    notificationSocket.on(socketEvents.received.inviteDeclined, (msg) => {
        const { inviteId } = msg; 
        console.log("Received invite declined event"); 
        if(receivedInvites.some(inv => inv.id === inviteId)) {
            console.log(`Removing received invite with ID ${inviteId}`)
            dispatch(removeReceivedInvite(inviteId)); 
        } else if(sentInvites.some(inv => inv.id === invite.Id)) {
            console.log(`Removing sent invite with ID ${inviteId}`);
            dispatch(removeSentInvite(inviteId)); 
        } else {
            console.log(`Received an invite declined event for an invite that doesn't exist within the current user's store ${inviteId}`);
        }
    });

    notificationSocket.on(socketEvents.received.inviteDeleted, (msg) => {
        const { inviteId } = msg;
        console.log("Received invite deleted event");
        if(receivedInvites.some(inv => inv.id === inviteId)) {
            dispatch(removeAcceptedInvite(inviteId)); 
        }
    })

    notificationSocket.on(socketEvents.received.friendRequestDeclined, (msg) => {
        console.log(`Handle friend request declined event`);
        if(msg && msg.friendRequest){
            const recId = msg.friendRequest.recipientId;
            const senderId = msg.friendRequest.senderId;
            if(false === requests.some(req => req.id === msg.friendRequest.id)){
                //Request doesn't exist, can't decline a request that doesn't exist!
                console.log(`Error: cannot mark a friend request as declined if it does not exist! Request with ID: ${msg.friendRequest.id}`);
                return;
            } else {
                if(recId === account.id){
                    if(friends.some(friend => friend.id === senderId)){
                        console.log(`Friend exists in state. Declining new friend request will result in deleted friendship.`);
                        dispatch(removeFriend(senderId));
                    } 
                    //If you declined the friend request, check if friend exists just in case and delete 
                    //And mark the request in the state with the same ID as declined/cancelled (whatever the property is in this redux state compared to the database, where it's "cancelled" as a boolean)
                    dispatch(declineRequest(msg.friendRequest.id));
                    toast.warning(`Friend request declined`, { position: "top-center", hideProgressBar: true, pauseOnHover: true, style: { opacity: 0.7 }});
                    console.log(`Successfully marked friend request with ID | ${msg.friendRequest.id} | as declined in state`, requests);
                    return;
                } else if(senderId === account.id){
                    //If you sent the request and now it's being declined, check if friend exists and delete
                    //Mark the request in the state as declined 
                    //Ensure that the user cannot request friendship with the user in the future (save the request, mark it as cancelled, on next outbound friendRequestSend check for any requests with same user ID && cancelled/declined)
                    if(friends.some(friend => friend.id === recId)){
                        console.log(`Friend exists in state. Declined friend request will result in deleted friendship.`);
                        dispatch(removeFriend(recId));
                    } 
                    dispatch(declineRequest(msg.friendRequest.id));
                    toast.warning(`Friend request declined`, { position: "top-center", hideProgressBar: true, pauseOnHover: true, style: { opacity: 0.7 }});
                    console.log(`Successfully marked friend request with ID | ${msg.friendRequest.id} | as declined in state`, requests);
                    return;
                } else {
                    console.log(`Error: cannot mark friend request as declined. Current user is not friend request sender or recipient`);
                    return;
                }
            }
        } else {
            console.log(`Error: cannot mark friend request as declined. Malformed message object from the server`);
            return;
        }
    });

    notificationSocket.on(socketEvents.received.friendAdded, (msg) => {
        console.log(`Handle friend added event`);
        if(msg && msg.friendRequest && msg.acceptor && msg.sender){
            const requestId = msg.friendRequest.id;
            const sender = msg.sender;
            const acceptor = msg.acceptor;
            const acceptorId = acceptor.id;
            //First check for the request and mark it as accepted 
            //If it doesn't error out
            if(requestExists(requestId, requests)){
                console.log(`Marking request with ID | ${requestId} | as accepted in the state`);
                dispatch(acceptRequest(requestId));
            } else {
                console.log(`Error: Friend Request with ID | ${requestId} | does not exist, cannot mark as accepted and add friend from it`);
                return;
            }
            if(acceptorId === account.id){
                //This user accepted the friendship, will add SENDER profile into redux state 
                //First, check if exists in friends already, return if so
                if(friends.some(fr => fr.id === sender.id)){
                    console.log(`Error: cannot add new friend that already exists`, friends, sender);
                    return;
                } else {
                    console.log(`Adding new friend @${sender.tagName} to friend's list`, sender);
                    dispatch(addFriend(sender));
                    return;
                }
            } else if(sender.id === account.id) {
                //This user sent the request, and it was accepted by the other user. Now they input the 
                //acceptor profile into the redux state
                if(friendExists(acceptorId, friends)){
                    console.log(`Error: cannot add new friend that already exists`, friends, acceptor);
                    return;
                } else {
                    console.log(`Adding new friend @${acceptor.tagName} to friend's list`, acceptor);
                    dispatch(addFriend(acceptor));
                    return;
                }
            } else {
                console.log(`Error: Friend request sender and recipient do not have IDs associated with current user`, msg.friendRequest, account.id);
                return;
            }
        } else {
            console.log(`Error: received friend request object from server is malformed`, msg);
            return;
        }
    });

    notificationSocket.on(socketEvents.received.friendRemoved, (msg) => {
        console.log(`Handle friend removed event`);
        if(msg && msg.exFriend1 && msg.exFriend2){
            const friend1 = msg.exFriend1;
            const friend2 = msg.exFriend2;
            if(friend1 === account.id){
                if(friendExists(friend2, friends)){
                    const friend = friends.filter(el => el.id === friend2)[0];
                    console.log(`Removing friend from friend's list`, friend);
                    dispatch(removeFriend(friend2));
                    return;
                } else {
                    console.log(`Error: friend with ID | ${friend2} | does not exist in friend's list, cannot remove`);
                    return;
                }
            } else if(friend2 === account.id){
                if(friendExists(friend1, friends)){
                    const friend = friends.filter(el => el.id === friend1)[0];
                    console.log(`Removing friend from friend's list`, friend);
                    dispatch(removeFriend(friend1));
                    return;
                } else {
                    console.log(`Error: friend with ID | ${friend1} | does not exist in friend's list, cannot remove`);
                    return;
                }
            } else {
                console.log(`Error: remove friend event does not have IDs associated with the current user or user's friend list`, friends, msg);
                return;
            }
        } else {
            console.log(`Error: remove friend event handler received a malformed message object from server`, msg);
        }
    });
    notificationSocket.on(socketEvents.received.refreshNotificationSuccess, (msg) => {
        console.log(`Successfully refreshed notification socket and set client ID to ${msg.clientId}`);
    });
}

export default function NotificationSocket(){
    const account = useSelector(selectAccount)
    const dispatch = useDispatch();
    const conversations = useSelector(selectConversations)
    const host = useSelector(selectHost);
    const sentInvites = useSelector(selectSent);
    const receivedInvites = useSelector(selectReceived);
    const friends = useSelector(selectFriends);
    const requests = useSelector(selectFriendRequests);
    const [connectionError, setConnectionError] = useState(false);

    const teardownEventListeners = (notificationSocket) => {
        if(notificationSocket == null || !notificationSocket){
            return true;
        }
        for(let key in socketEvents.received){
            notificationSocket.off(socketEvents.received[key]);
        }
    }

    useEffect(() => {
        console.log("Attemping to establish notifications socket");
        const notificationSocketOptions = {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        credentials: "include"
                    }
                }
            },
            forceNew: true,
            reconnectionAttempts: 5
        }
        if(account.loggedIn === true && connectionError !== true){
            try {
                console.log("Attemping connection to notifications socket gateway");
                try {
                    notificationSocket = io(`${host}/notifications`, notificationSocketOptions);
                } catch (err) {
                    console.error("Error: Notifications socket cannot establish polling/ws connection with the server");
                    setConnectionError(true); 
                    return; 
                }
                setupEventListeners(notificationSocket, dispatch, account, friends, requests, conversations, sentInvites, receivedInvites);
                notificationSocket.emit('refreshNotificationSocket', { userId: account.id } );
                console.log("Successfully setup notifications socket");
                return () => {
                    teardownEventListeners(notificationSocket);
                }
            } catch(err) {
                console.log("Error establishing notifications notificationSocket", err)
            }
        }
        return () => {
            if(notificationSocket) {
                Object.keys(socketEvents.received).map(el => notificationSocket.off(el));
                notificationSocket.close();    
                notificationSocket = null;
            }
        }
        
    }, [account?.loggedIn]);
    return null;
}

export { notificationSocket };