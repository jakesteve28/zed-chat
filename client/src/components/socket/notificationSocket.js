import { useEffect } from 'react';
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
import { addReceivedInvite, addSentInvite, selectReceived, selectSent } from '../../store/slices/inviteSlice';
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
        refreshNotificationSuccess: "refreshNotificationSuccess"
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
    return idExists(id, requests);
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
                        toast.info(`Invite received from: @${msg.invite.user.tagName}` , { position: "top-center", hideProgressBar: true, pauseOnHover: true} );
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
                toast.info(`Invite successfully sent!` , { position: "top-center", hideProgressBar: true, pauseOnHover: true });
            } else {
                throw `Error: Invite sent data received from the server is malformed | ${msg}`;
            }
        } catch(err) {
            console.log("Error with sending invite from server", err);
        }
    });

    notificationSocket.on(socketEvents.received.inviteSentError, (msg) => {
        console.log(`Handle invite sent error from server | ${msg.msg}`);
    });

    notificationSocket.on(socketEvents.received.acceptedInvite, (msg) => {
        console.log(`Handle conversation invite accepted by user ID | ${msg.invite.recipientId}`); 
        if(msg.conv && msg.invite && msg.invite.senderId === account.id){
            //Event from server, with NOT pending conversation object, emitted to the sender of the conversation invite
            console.log(`Setting conversation with ID | ${msg.conv.id} | to not pending for sender`); 
            dispatch(removeConversation({ id: msg.conv.id }));
            dispatch(addConversation({ conversation: msg.conv }));
            const user = friends.filter(el => el.id === msg.invite.recipientId)[0];
            if(user) toast.info(`Conversation Invite accepted by @${user.tagName}` , { position: "top-center", hideProgressBar: true, pauseOnHover: true} );
            else console.log(`Error: friend with ID | ${msg.invite.senderId} | does not exist, cannot accept conversation!`, msg.invite, friends);
            return;
        } else if(msg.conv && msg.invite && msg.invite.recipientId === account.id){
            //Event from server, with NOT pending conversation object, emitted back to the recipient of the conversation invite after they accept
            console.log(`Setting conversation with ID | ${msg.conv.id} | to not pending`); 
            //dispatch(removeConversation({ id: msg.conv.id }));
            dispatch(addConversation({ conversation: msg.conv }));
            const user = friends.filter(el => el.id === msg.invite.senderId)[0];
            if(user) toast.info(`Conversation Invite accepted by @${user.tagName}` , { position: "top-center", hideProgressBar: true, pauseOnHover: true} );
            else console.log(`Error: friend with ID | ${msg.invite.senderId} | does not exist, cannot accept conversation!`, msg.invite, friends);
            return;
        } else {
            console.log(`Error: accepted invite data from server incorrectly formatted!`, msg);
        }
    });    

    notificationSocket.on(socketEvents.received.acceptInviteError, (msg) => {
        console.log(`Handle accept invite error from server | ${msg.msg}`);
    });

    notificationSocket.on(socketEvents.received.friendRequestSent, (msg) => {
        console.log(`Handle friend request sent event`);
        if(msg && msg.friendRequest){
            const recId = msg.friendRequest.recipientId;
            const senderId = msg.friendRequest.sender.id;
            if(recId === account.id){
                //Recipient of friend request
                if(friendExists(senderId, friends)){
                    console.log(`Error: Cannot receive a friend request from user that is already in friend's list!`, msg.friendRequest.sender, friends);
                    return;
                } else {
                    dispatch(addFriendRequest(msg.friendRequest));
                    toast.info(`Friend request received from user @${msg.friendRequest.sender.tagName}`, { position: "top-center", hideProgressBar: true, pauseOnHover: true} );
                    console.log(`Successfully received friend request with ID | ${msg.friendRequest.id} | and added to state`);
                    return;
                }
            } else if(senderId === account.id){
                //Sender of friend request
                if(friendExists(recId, friends)){
                    console.log(`Error: Cannot send a friend request to a user that is already in friend's list!`, msg.friendRequest.recipientId, friends);
                    return;
                } else {
                    dispatch(addFriendRequest(msg.friendRequest));
                    toast.info(`Successfully sent friend request to ${msg.friendRequest.recipientId}`,  { position: "top-center", hideProgressBar: true, pauseOnHover: true})
                    console.log(`Successfully sent friend request with ID | ${msg.friendRequest.id} | and added to state`);
                    return;
                }
            } else {
                console.log(`Error: Friend request object does not contain a user with ID equal to this account!`, msg.friendRequest);
                return;
            }
        } else {
            console.log(`Error: malformed friend request sent event message object! ${msg}`);
            return;
        }
    });

    notificationSocket.on(socketEvents.received.friendRequestSentError, (msg) => {
        console.log(`Error: friend request sent server error | ${msg.msg}`);
        toast.warning(`Server error: friend request not sent! ${msg.err}` , { position: "top-center", hideProgressBar: true, pauseOnHover: true})
    });

    notificationSocket.on(socketEvents.received.friendRequestDeclined, (msg) => {
        console.log(`Handle friend request declined event`);
        if(msg && msg.friendRequest){
            const recId = msg.friendRequest.recipientId;
            const senderId = msg.friendRequest.sender.id;
            if(false === requestExists(msg.friendRequest.id, requests)){
                //Request doesn't exist, can't decline a request that doesn't exist!
                console.log(`Error: cannot mark a friend request as declined if it does not exist! Request with ID: ${msg.friendRequest.id}`);
                return;
            } else {
                if(recId === account.id){
                    if(friendExists(senderId, friends)){
                        console.log(`Friend exists in state. Declining new friend request will result in deleted friendship.`);
                        dispatch(removeFriend(senderId));
                    } 
                    //If you declined the friend request, check if friend exists just in case and delete 
                    //And mark the request in the state with the same ID as declined/cancelled (whatever the property is in this redux state compared to the database, where it's "cancelled" as a boolean)
                    dispatch(declineRequest(msg.friendRequest.id));
                    console.log(`Successfully marked friend request with ID | ${msg.friendRequest.id} | as declined in state`, requests);
                    return;
                } else if(senderId === account.id){
                    //If you sent the request and now it's being declined, check if friend exists and delete
                    //Mark the request in the state as declined 
                    //Ensure that the user cannot request friendship with the user in the future (save the request, mark it as cancelled, on next outbound friendRequestSend check for any requests with same user ID && cancelled/declined)
                    if(friendExists(recId, friends)){
                        console.log(`Friend exists in state. Declined friend request will result in deleted friendship.`);
                        dispatch(removeFriend(recId));
                    } 
                    dispatch(declineRequest(msg.friendRequest.id));
                    toast.warning(`Friend request declined`, { position: "top-center", hideProgressBar: true, pauseOnHover: true});
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

    notificationSocket.on(socketEvents.received.friendRequestDeclinedError, (msg) => {
        console.log(`Error: server error while declining friend request ${msg.msg}`);
    });

    notificationSocket.on(socketEvents.received.friendAdded, (msg) => {
        console.log(`Handle friend added event`);
        if(msg && msg.friendRequest && msg.acceptor){
            const requestId = msg.friendRequest.id;
            const sender = msg.friendRequest.sender;
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
                if(friendExists(sender.id, friends)){
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

    notificationSocket.on(socketEvents.received.acceptFriendRequestError, (msg) => {
        console.log(`Error: server error while accept friend request action performed ${msg.msg}`);
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
    notificationSocket.on(socketEvents.received.friendRemovedError, (msg) => {
        console.log(`Error: Friend removed server error | ${msg.msg}`);
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
            forceNew: true
        }
        if(account.loggedIn === true){
            try {
                console.log("Attemping connection to notifications socket gateway");
                notificationSocket = io(`${host}/notifications`, notificationSocketOptions);
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