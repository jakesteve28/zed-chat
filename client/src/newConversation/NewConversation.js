import React, { useState, useEffect } from 'react';
import { Row, Col, InputGroup, FormControl, Button } from 'react-bootstrap';
import { selectFriends } from '../account/friendsSlice';
import { useSelector, useDispatch } from 'react-redux';
import useWindowSize from '../sidebar/windowSize';
import './new-conversation.css';
import regex from '../regex.js';

export default function NewConversation(){
    const friends = useSelector(selectFriends); 
    const [searchBar, _setSearchBar] = useState("");
    const [conversationName, setConversationName] = useState("");
    const size = useWindowSize();
    const [errorMsgs, setErrorMsgs] = useState([]);
    const [error, setError] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [sidebarAlign, setSidebarAlign] = useState(false);
    const checkInput = () => {
        let passing = true;
        if(regex.conversationName.test(conversationName) === false){
            setErrorMsgs(["Invalid Conversation Name", ...errorMsgs]);
            passing = false;
        }
        if(!passing) setError(true);
        return passing;
    }
    const submit = () => {
        if(!checkInput()){
            console.log("Errors: ", errMsgs);
            return;
        } 
        alert("Test submit new conversation");
        console.log("Creating new conversation and sending invites to users from friends list. Users: ", selectedFriends);
    }
    useEffect(() => {
        setSelectedFriends(
            friends.filter((friend) => {
                return friend.tagName && (friend.tagName.includes(searchBar) || searchBar.includes(friend.tagName));
            })
        )
    }, [searchBar]);

    //TODO integrate this function to new conversation screen/send out invites
    // const createConversation = async () => {
    //     setError(false)
    //     setErrorMsg('')
    //     if(friends) {
    //       if(friends.filter(fr => fr.tagName === `${value}`).length < 1){
    //           console.log("Error send conversation request", account, notificationSocket) 
    //           setError(true)
    //           setErrorMsg("Friend does not exist")
    //       } else {
    //         if(token){
    //           const res = await fetch("http://localhost:3000/api/conversation/create",
    //             {
    //               method: "POST",
    //               body: JSON.stringify(reqBody),
    //               headers: {
    //                 "Authorization": `Bearer ${token}`,
    //                 "content-type": "application/json"
    //               }
    //             }
    //           )
    //           const conv = await res.json()
    //           sendInvite(conv.id)
    //           console.log("Invite sent for conv")
    //           dispatch(addConversation({ conversation: conv }))
    //         } else {
    //         console.log("Cannot create conversation without token: " + token)
    //       }
    //     }
    //     } else {
    //           console.log("Error send conversation request", account, notificationSocket) 
    //           setError(true)
    //           setErrorMsg("Friend's list does not exist")
    //     }
    //   }

    useEffect(() => {
        if(size.width > 768) {
            setSidebarAlign(true);
        } else {
            setSidebarAlign(false);
        }
    }, [size.width])
    return (
        <div className={(sidebarAlign) ? "sidebar-padding new-conv-container" : "new-conv-container"}>
            <Row className="pt-1 mb-4">
                <Col className="text-center lead" style={{ color: "#EEEEEE", opacity: 0.75 }}>
                    <h4>Add Friend(s) to New Conversation</h4>
                </Col>
            </Row>
            <Row className="mt-2 mb-2">
                <Col className="text-center mx-auto friend-search-new-chat">
                    <InputGroup className="mb-5 mt-2">
                        <FormControl
                            style={{ color: "white", opacity: 0.7, maxWidth: '400px', minHeight: '50px', border: 'none', backgroundColor: "#404040", maxWidth: "250px" }}
                            placeholder="Enter name of Conversation"
                            aria-label="Enter name of Conversation"
                            aria-describedby="basic-addon1"
                            onChange={ e => setConversationName(e.target.value) }
                        />
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Col className="text-center mx-auto friend-search-new-chat">
                    <InputGroup className="mb-5 mt-2">
                        <FormControl
                            style={{ color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px', border: 'none', backgroundColor: "#404040" }}
                            placeholder="Search friend tagnames"
                            aria-label="Search friend tagnames"
                            aria-describedby="basic-addon1"
                            onChange={ e => _setSearchBar(e.target.value) }
                        />
                    </InputGroup>
                </Col>
            </Row>
            {
                friends.map((friend) => {
                    return (
                        <Row key={friend.id}>
                            <Col className="friend-new-chat text-white text-center mx-auto">
                                @{friend.tagName}
                            </Col>
                        </Row>
                    )
                })
            }
            <Button variant="outline-danger" block style={{ opacity: 0.67, position: 'fixed', left: "80%", bottom: "150px"}} onClick={ () => submit() }>Submit</Button>
        </div>)
}