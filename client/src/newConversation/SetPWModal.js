import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, InputGroup, FormControl, Button, Container } from 'react-bootstrap';
import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption';
import regex from '../regex';
import useWindowSize from '../sidebar/windowSize';
import './modal.css'
export default function PasswordModalBody({ handleSetConvPassword }) {
    const [pw, setPW] = useState("");
    const [error, setError] = useState(false);
    const errorMsgs = useRef([]);
    const setPwRef = useRef(null);
    const size = useWindowSize();

    const checkInput = () => {
        let passing = true;
        if(regex.password.test(pw) === false) {
            passing = false;
            errorMsgs.current.push("Invalid Password. Must be 8-32 characters");
        }
        if(!passing) setError(true); 
        return passing;
    }
    const submit = () => {
        setError(false);
        errorMsgs.current = [];
        if(!checkInput()) {
            console.log("Error with password", errorMsgs);
            return;
        }
        handleSetConvPassword(pw);
    }

    useEffect(() => {
        if(setPwRef.current != null)
            setPwRef.current.focus();
    }, [setPwRef]);

    return (
        <div className="modal-password-set">
            <Container fluid>
                <Row className="pt-2 pb-3">
                    <Col style={{ borderBottom: "1px solid #303030" }} xs="10" className="mx-auto text-center pt-3">
                        <EnhancedEncryptionIcon style={{ width: 50, height: 50 }}></EnhancedEncryptionIcon>
                    </Col>
                </Row>
                <Row>
                    <Col className="mx-auto text-center pt-1 pb-3">
                        <h5>Set Password</h5>
                    </Col>
                </Row>
                <Row className="pt-2 mt-1">
                    <Col style={{ borderBottom: "1px solid #303030"}} className="mx-auto text-center" xs="10">
                        <InputGroup className="mb-3 mt-2 mx-auto">
                                <FormControl
                                    style={{ textAlign: "center", color: "#3b90ff", minHeight: '50px', border: 'none', minWidth: "80%", backgroundColor: "#191919" }}
                                    placeholder="Enter Password"
                                    type="password"
                                    aria-label="Enter Password"
                                    aria-describedby="basic-addon1"
                                    onChange={ e => {
                                        setPW(e.target.value);
                                    }}
                                    className={ (error) ? "mx-auto lead form-control-red" : "mx-auto lead form-control-custom"}
                                    ref={setPwRef}
                                    autoComplete="new-password"
                                    name="setPWNewConv"
                                />
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="pt-3 mt-2">
                    <Col className="mx-auto text-center" xs="10">
                        <Button onClick={ () => submit() } variant="outline-success" style={{ border: "none", backgroundColor: "#191919", marginLeft: "auto", marginRight: "auto"}} className="rounded-pill">Set Password</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}