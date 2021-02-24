import React, { useState, useEffect } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './listitems.css';
import '../topbar/topbar.css';

export default function FriendCheckBoxListItem({ tagName, onCheck }){
    const [checked, setChecked] = useState(false);
    const check = () => {
        setChecked(!checked);
    }
    useEffect(() => {
        onCheck(tagName, checked);
    }, [checked]);
    return (
        <Row className="p-2">
            <Col className="text-center justify-content-around">
                <Button onClick={() => check()} className={(checked) ? "p-3 m-2 account-button-checked" : "p-3 m-2 account-button"} variant="dark" style={{ border: "none", backgroundColor: "#202020", padding: "15px", minWidth: "150px", maxWidth: "150px", minHeight: "125px", maxHeight: "125px" }} >@{tagName}</Button>
            </Col> 
        </Row>    
    )
}

FriendCheckBoxListItem.propTypes = {
    tagName: PropTypes.string, 
    onCheck: PropTypes.func
}
