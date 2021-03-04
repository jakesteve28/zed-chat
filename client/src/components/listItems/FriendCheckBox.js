import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './listitems.css';
import '../topbar/topbar.css';
import DoneIcon from '@material-ui/icons/Done';
export default function FriendCheckBoxListItem({ tagName, onCheck }){
    const [checked, setChecked] = useState(false);
    const check = () => {
        setChecked(!checked);
    }
    useEffect(() => {
        onCheck(tagName, checked);
    }, [checked]);
    return (
        <Row className="p-2" onClick={() => check()} className={(checked) ? "friend-button-checked" : "friend-button"}>
            <Col className="checkbox-column">
                <DoneIcon className={(checked) ? "friend-button-icon-checked" : "friend-button-icon"}></DoneIcon>
            </Col>
            <Col className="tagname-column">
                @{tagName}
            </Col>        
        </Row>    
    )
}

FriendCheckBoxListItem.propTypes = {
    tagName: PropTypes.string, 
    onCheck: PropTypes.func
}
