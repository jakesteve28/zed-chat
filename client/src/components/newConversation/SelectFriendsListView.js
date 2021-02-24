import React, { useState, useEffect } from 'react';
import { Row, Col, InputGroup, FormControl, Button, Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { selectFriends } from '../../store/slices/friendsSlice';
import { useSelector } from 'react-redux';
import regex from '../../util/regex.js';
import { SearchOutlined } from '@material-ui/icons';
import FriendListItemCheckBox from '../listItems/FriendCheckBox';

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
        <Container fluid>
            <Row className="pb-3">
                <Col xs="2"></Col>
                <Col xs="8" className="border-bottom border-dark" style={{ maxWidth: "450px" }}>
                    <InputGroup className="mb-3 mt-2 mx-auto">
                        <FormControl
                            style={{ textAlign: "center", fontSize: "18pt", color: "#EEEEEE", opacity: 0.8, minHeight: '50px', border: 'none', backgroundColor: "#191919" }}
                            placeholder="Search friends"
                            aria-label="Search friends"
                            aria-describedby="basic-addon1"
                            onChange={ e => setSearchBar(e.target.value) }
                            className={ (errorSearch) ? "mx-auto lead form-control-red font-italic" : "mx-auto lead form-control-custom font-italic"}
                            value={searchBar}
                            autoComplete="new-password"
                            />
                        </InputGroup>
                </Col>
                <Col xs="2" style={{ maxWidth: "50px" }}>
                    <Button onClick={() => { filterList() }} variant="dark" style={{ marginTop: "10px", display: "block", backgroundColor: "#191919", border: "none" }}><span className="text-primary text-lg-center"><SearchOutlined style={{ color: "#BBBBBB", height: 35, width: 35, cursor: "pointer"}}></SearchOutlined></span></Button>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col className="mx-auto">
                    <span className="font-italic text-small" style={{ color: "dodgerblue"}}>Select Friends For Chat</span>
                </Col>
            </Row>
            <Row>
                <Col xs="2"></Col>
                <Col xs="8" style={{ maxWidth: "500px" }}>
                    <Container fluid style={{ minHeight: "225px", overflowY: "scroll", backgroundColor: "#191919"}}>
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
                <Col xs="2"></Col>
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