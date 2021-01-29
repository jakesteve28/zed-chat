import React, { useState, useEffect } from 'react';
import { Button, InputGroup, FormControl, Container, Row, Col } from 'react-bootstrap';
import './createaccount.css';
import { Redirect } from 'react-router-dom';
import regex from '../regex';
import useWindowSize from '../sidebar/windowSize';
import { useDispatch } from 'react-redux';
import { setTopbarMessage } from '../uiSlice';

function CreateAccount(){
    const [tagName, setTagName] = useState("");
    const [email, setEmail] = useState("");
    const [pw1, setPW1] = useState("");
    const [pw2, setPW2] = useState("");
    const [backToLogin, setBackToLogin] = useState(false);
    const [error, setError] = useState(false);
    const [errorMsgs, setErrorMsgs] = useState([]);
    const [passwordNoMatch, setPasswordNoMatch] = useState(false);
    const [tagnameInvalid, setTagnameInvalid] = useState(false);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [pw1Invalid, setPw1Invalid] = useState(false);
    const [pw2Invalid, setPw2Invalid] = useState(false);
    const size = useWindowSize();
    const dispatch = useDispatch();

    const clearErr = () => {
        setPasswordNoMatch(false);
        setTagnameInvalid(false);
        setEmailInvalid(false);
        setPw1Invalid(false);
        setPw2Invalid(false);
    }
    const checkInput = () => {
        let passing = true;
        const arr = []
        if(pw1 !== pw2){
            arr.push("Passwords don't match")
            setPasswordNoMatch(true);
            passing = false;
        }
        if(regex.tagName.test(tagName) === false){
            arr.push("Invalid Tagname");
            setTagnameInvalid(true);
            passing = false;
        }
        if(regex.email.test(email) === false){
            arr.push("Invalid Email")
            setEmailInvalid(true);
            passing = false;
        }
        if(regex.password.test(pw1) === false){
            arr.push("Invalid Password. Must be 10-32 characters and digits.")
            setPw1Invalid(true);
            passing = false;
        }
        if(regex.password.test(pw2) === false){
            arr.push("Invalid Second Password. Must be 10-32 characters and digits.")
            setErrorMsgs(arr);
            setPw1Invalid(true);
            passing = false;
        }
        if(!passing) {
            setError(true);
            setErrorMsgs(arr);
        }
        return passing;
    }
    const submit = async () => {
        setError(false);
        clearErr();
        if(!checkInput()){
            console.log("Error with data submission: ", errorMsgs)
            return;
        }
        const bd = {
            email: email,
            password: pw1,
            session: 0,
            tagName: tagName
        }
        const res = await fetch("http://localhost:3000/api/users/", {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(bd)
        })
        const body = await res.json();
        console.log(body);
        setBackToLogin(true);
    }

    useEffect(() => {
        dispatch(setTopbarMessage(""))
    }, []);

    return (
        (!backToLogin) ? 
        <Container className="h-100 w-100" fluid>
            <Row className="p-3 mt-5 text-white lead text-center">
                <Col className="p-3 text-center, mx-auto pt-5 mt-5 shadow" style={{ borderRadius: "15px", backgroundColor: "#191919", opacity: 0.6, maxWidth: "500px" }}> 
                    <h4 className="text-white" style={{ opacity: 0.8, marginBottom: "55px" }}>Enter your account information</h4>
                    <InputGroup className="mb-5 mt-3">
                        <FormControl
                            style={{ marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px',border: 'none',  backgroundColor: "#404040" }}
                            placeholder="Email Address"
                            aria-label="Email Address"
                            aria-describedby="basic-addon1"
                            onChange={ (e) => setEmail(e.target.value) }
                            className={(emailInvalid) ? "form-control-error" : "form-control-normal"}
                        />
                    </InputGroup>
                    <InputGroup  className="mb-5 mt-3">
                        <FormControl
                            style={{ marginLeft: "auto", marginRight: "auto", color:  "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px',border: 'none',  backgroundColor: "#404040" }}
                            placeholder="Desired Tag Name"
                            aria-label="Desired Tag Name"
                            aria-describedby="basic-addon1"
                            onChange={ (e) => setTagName(e.target.value) }
                            className={(tagnameInvalid) ? "form-control-error" : "form-control-normal"}
                        />
                    </InputGroup>
                    <InputGroup className="mb-5 mt-3">
                        <FormControl
                            style={{ marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px',border: 'none',  backgroundColor: "#404040" }}
                            type="password"
                            placeholder="Desired Password"
                            aria-label="Desired Password"
                            aria-describedby="basic-addon1"
                            onChange={ (e) => setPW1(e.target.value) }
                            className={(pw1Invalid || passwordNoMatch) ? "form-control-error" : "form-control-normal"}
                            />
                    </InputGroup>
                    <InputGroup  className="mb-5 mt-3">
                        <FormControl
                            style={{ marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px',border: 'none',  backgroundColor: "#404040" }}
                            type="password"
                            placeholder="Confirm Password"
                            aria-label="Confirm Password"
                            aria-describedby="basic-addon1"
                            onChange={ (e) => setPW2(e.target.value) }
                            className={(pw2Invalid || passwordNoMatch) ? "form-control-error" : "form-control-normal"}
                            />
                    </InputGroup>
                    <Button onClick={submit} size="lg" className="rounded-pill mb-4 mx-auto" variant="outline-success" style={{ opacity: 0.8, maxWidth: '200px' }} block>Sign Up</Button>
                    <Container fluid style={{ opacity: 1.2 }}>
                        <Row>
                          <Col className="mx-auto text-left">
                            <ul style={{ listStyleType: "none", marginRight: "auto", marginLeft: "auto", paddingRight: "30px" }}>
                              {(error) ?  <li><h6 className="border-bottom pb-2 border-danger text-danger font-weight-bold">Errors</h6></li> : ""}
                              {
                                (error) ? errorMsgs.map(el => (<li key={el} className="font-italic lead text-danger">{el}</li>)) : ""
                              }   
                            </ul>    
                          </Col>
                        </Row>  
                      </Container>
                </Col> 
            </Row>
        </Container>
      : <Redirect to="/login"></Redirect>
    );
}
export default CreateAccount;