import React, { useState, useEffect } from 'react';
import { Button, InputGroup, FormControl, Container, Row, Col } from 'react-bootstrap';
import { Redirect, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTopbarMessage } from '../../store/slices/uiSlice';
import './createaccount.css';
import regex from '../../util/regex';
import Recaptcha from '../recaptcha/Recaptcha';
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
    const [recaptchaPassed, setRecaptchaPassed] = useState(false); 
    const [recaptchaError, setRecaptchaError] = useState(false); 
    const dispatch = useDispatch();
    const history = useHistory();
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

    useEffect(() => {
        if(recaptchaError === true) {
            alert('You failed a Recaptcha or it expired. Taking you back to login screen');
            history.push('/login');
        }
    }, [recaptchaError]);

    return (
        (!backToLogin) ? 
        <Container className="h-100 w-100" fluid>
            <Row className="p-3 mt-5 text-white lead text-center">
                <Col className="p-3 text-center, mx-auto pt-5 mt-5 shadow create-account-column"> 
                    <h4 className="text-white create-account-title">Enter your account information</h4>
                    <InputGroup className="mb-5 mt-3">
                        <FormControl
                            placeholder="Email Address"
                            aria-label="Email Address"
                            aria-describedby="basic-addon1"
                            onChange={ (e) => setEmail(e.target.value) }
                            className={(emailInvalid) ? "form-control-error create-account-form-control" : "form-control-normal create-account-form-control"}
                        />
                    </InputGroup>
                    <InputGroup  className="mb-5 mt-3">
                        <FormControl
                            placeholder="Desired Tag Name"
                            aria-label="Desired Tag Name"
                            aria-describedby="basic-addon1"
                            onChange={ (e) => setTagName(e.target.value) }
                            className={(tagnameInvalid) ? "form-control-error create-account-form-control" : "form-control-normal create-account-form-control"}
                        />
                    </InputGroup>
                    <InputGroup className="mb-5 mt-3">
                        <FormControl
                            type="password"
                            placeholder="Desired Password"
                            aria-label="Desired Password"
                            aria-describedby="basic-addon1"
                            onChange={ (e) => setPW1(e.target.value) }
                            className={(pw1Invalid || passwordNoMatch) ? "form-control-error create-account-form-control" : "form-control-normal create-account-form-control"}
                            />
                    </InputGroup>
                    <InputGroup  className="mb-5 mt-3">
                        <FormControl
                            type="password"
                            placeholder="Confirm Password"
                            aria-label="Confirm Password"
                            aria-describedby="basic-addon1"
                            onChange={ (e) => setPW2(e.target.value) }
                            className={(pw2Invalid || passwordNoMatch) ? "form-control-error create-account-form-control" : "form-control-normal create-account-form-control"}
                            />
                    </InputGroup>
                    <Container fluid className="pt-1 pb-1 mt-1 mb-1 p-3">
                    <Row>
                        <Col xs="8" className="mx-auto p-3 text-center">
                            <Recaptcha
                                recaptchaChanged={setRecaptchaPassed}
                                recaptchaError={setRecaptchaError}
                                recaptchaExpired={setRecaptchaError}
                            >
                            </Recaptcha>
                        </Col>
                    </Row>
                    </Container>
                    <Button onClick={submit} size="lg" className="rounded-pill mb-4 mx-auto create-account-button" variant={(!recaptchaPassed) ? "outline-dark" : "outline-success"} block disabled={!recaptchaPassed}>Sign Up</Button>
                    <Container fluid>
                        <Row>
                          <Col className="mx-auto text-left">
                            <ul className="create-account-error-list">
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