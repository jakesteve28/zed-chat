import React, { useState, useEffect } from 'react';
import { Row, Col, InputGroup, FormControl, Button, Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { selectFriends } from '../../store/slices/friendsSlice';
import { useSelector } from 'react-redux';
import regex from '../../util/regex.js';
import { SearchOutlined } from '@material-ui/icons';
import FriendListItemCheckBox from '../listItems/FriendCheckBox';
import './startchat.css';

export default function SelectFriendsListView({ 
        errorSearch, 
        selectedFriends, 
        setSelectedFriends, 
        setErrorSearch, 
        setError, 
        errorMsgs,
        setButtonsDisabled
    }){
    const friends = useSelector(selectFriends); 
    const [searchBar, setSearchBar] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);

    useEffect(() => {
        setFilteredFriends(JSON.parse(JSON.stringify(friends)));
    }, [friends]);

    useEffect(() => {
        if(selectedFriends.length < 1){
            setButtonsDisabled(true);
            console.log("Buttons disabled")
        } else {
            setButtonsDisabled(false);
            console.log("Buttons enabled")
        }
    }, [selectedFriends]);

    const filterList = () => {
        setErrorSearch(false);
        setError(false);
        errorMsgs.current = []
        if(regex.tagName.test(searchBar) === false){
            setErrorSearch(true);
            setError(true);
            setSearchBar("");
            errorMsgs.current.push("Invalid tagname for search");
            return;
        }
        setFilteredFriends(filteredFriends.filter(friend => (friend.tagName.includes(searchBar) || searchBar.includes(friend.tagName))));
    }
    const handleCheck = (tagName, checked) => {
        const arr = JSON.parse(JSON.stringify(selectedFriends));
        if(checked){
            if(selectedFriends.length > 0){
                if(selectedFriends.filter(fr => fr === tagName).length > 1){
                    return;
                } else {
                    arr.push(tagName)
                    setSelectedFriends(arr);
                    return;
                }
            } else {
                setSelectedFriends([tagName]);
                return;
            }   
        } else {
            if(selectedFriends.length > 0){
                if(selectedFriends.filter(fr => fr === tagName).length > 0){
                    setSelectedFriends(selectedFriends.filter(fr => fr !== tagName));
                    return;
                } else {
                    return;
                }
            } else {
                setSelectedFriends([]);
            }
        }
    }
    return (
        <Container fluid className="select-friend-container">
            <Row className="pb-3">
                <Col className="start-chat-search-name">
                    <InputGroup className="mb-3 mt-2 mx-auto">
                        <FormControl
                            placeholder="Search friends"
                            aria-label="Search friends"
                            aria-describedby="basic-addon1"
                            onChange={ e => setSearchBar(e.target.value) }
                            className={ (errorSearch) ? "mx-auto lead form-control-red placeholder-search select-friend-search" : "mx-auto lead form-control-custom placeholder-search select-friend-search"}
                            value={searchBar}
                            autoComplete="new-password"
                            />
                        <Button onClick={() => { filterList() }} variant="dark" className="search-friends"><span className="text-primary text-lg-center"><SearchOutlined className="search-friends-icon"></SearchOutlined></span></Button>
                    </InputGroup>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <Container fluid className="checked-friends-list-container">
                        {
                            (filteredFriends && filteredFriends.length > 0) ?
                            (
                                filteredFriends.map((friend) => {
                                    return (
                                        <FriendListItemCheckBox key={friend.id} id={friend.id} tagName={friend.tagName} onCheck={handleCheck}></FriendListItemCheckBox>
                                    );
                                }) 
                            )
                            : 
                            <Row className="mb-4">
                                <Col className="mx-auto text-center text-muted font-italic pt-5">
                                    No friends available! Add a friend!
                                </Col>
                            </Row>
                        }
                    </Container>
                </Col>
            </Row>
        </Container>
    )
}
SelectFriendsListView.propTypes = {
    errorSearch: PropTypes.bool,
    selectedFriends: PropTypes.array, 
    setSelectedFriends: PropTypes.func, 
    setErrorSearch: PropTypes.func,
    setError: PropTypes.func,
    errorMsgs: PropTypes.array,
    setButtonsDisabled: PropTypes.func
}