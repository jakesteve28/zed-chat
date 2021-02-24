import React, { useState, useRef } from 'react';
import { Row, Col, Container, InputGroup, FormControl, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import regex from '../../util/regex';
import './settings-modal.css';

export default function ChangeTagname({ logoutAccount }) {
    const [newTagname, setNewTagname] = useState("");
    const [tagNameError, setTagnameError] = useState(false);
    const errorMsgs = useRef([]);

    const checkInput = () => {
        let passing = true; 
        if(regex.tagName.test(newTagname) === false) {
            console.log("Error: new tagname failed regex test");
            errorMsgs.current.push("Error: new tagname failed regex test");
            passing = false;
        }
        if(!passing) setTagnameError(true);
        return passing;
    }

    const submit = () => {
        errorMsgs.current = []
        setTagnameError(false);
        if(!checkInput()){
            return; 
        } else {
            alert("Tagname changed successfully?");
            logoutAccount();
        }
    }

    return (
        <div className="settings-modal">
            <Container fluid>
                <Row>
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <h3>Change Tagname</h3>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <span className="text-warning">Note that this is permanent, will require a logout, and will automatically update your friends lists.</span>
                    </Col>
                </Row>
                <Row className="pt-2 pb-2 mb-1">
                    <Col className="mx-auto text-center text-white" xs="12">
                        <InputGroup>
                          <FormControl
                            style={{marginLeft: "auto", maxWidth: "300px", marginRight: "auto", color: "white", opacity: 0.87, minWidth: "200px", minHeight: '50px', backgroundColor: "#212121", border: 'none' }}
                            placeholder="Enter desired Tagname"
                            aria-label="Enter desired Tagname"
                            aria-describedby="basic-addon1"
                            className={(tagNameError) ? "change-tagname-input error-placeholder" : "change-tagname-input"}
                            onChange={(e) => { setNewTagname(e.target.value) }}
                          />
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <span className="text-muted font-italic">Must be 8-24 letters, numbers, dashes or underscores</span>
                    </Col>
                </Row>
                <Row className="pt-2 mt-2">
                    <Col className="text-center">
                        <Button onClick={() => submit()} variant="outline-success" size="lg" style={{ padding: "10px"}}>Submit</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

ChangeTagname.propTypes = {
    logoutAccount: PropTypes.func
}