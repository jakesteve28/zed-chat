import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../styles/listitems.css';
import '../../styles/topbar.css';
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
        <Row onClick={() => check()} className={(checked) ? "p-2 friend-button-checked" : "p-2 friend-button"}>
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
