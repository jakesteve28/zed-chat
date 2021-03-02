import React, { useState, useEffect } from 'react';
import { Row  } from 'react-bootstrap';
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
        <Row className="p-2">
            <span onClick={() => check()} className={(checked) ? "friend-button-checked" : "friend-button"}>         
                    <DoneIcon className={(checked) ? "friend-button-icon-checked" : "friend-button-icon"}></DoneIcon>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    @{tagName}
            </span>
        </Row>    
    )
}

FriendCheckBoxListItem.propTypes = {
    tagName: PropTypes.string, 
    onCheck: PropTypes.func
}
