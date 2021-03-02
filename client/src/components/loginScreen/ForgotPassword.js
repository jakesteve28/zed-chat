import React, { useState, useEffect } from 'react'
import {  Button, InputGroup, FormControl, Container, Row, Col } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import regex from '../../util/regex';
import { setTopbarMessage } from '../../store/slices/uiSlice';
import './createaccount.css';
import './forgotpassword.css';
export default function ForgotPassword(){
    const [email, setEmail] = useState("");
    const [tagname, setTagname] = useState("");
    const [error, setError] = useState(false);
    const [errorMsgs, setErrorMsgs] = useState([]);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [tagnameInvalid, setTagnameInvalid] = useState(false);
    const dispatch = useDispatch();

    const clearErr = () => {
      setEmailInvalid(false);
      setTagnameInvalid(false);
    }
    const checkInput = () => {
      let passing = true;
      const arr = [];
      if(regex.email.test(email) === false){
          arr.push("Invalid Email Address!");
          setEmailInvalid(true);
          passing = false;
      }
      if(regex.tagName.test(tagname) === false){
          arr.push("Tag name must be 8-24 characters");
          setTagnameInvalid(true);
          passing = false;
      }
      if(!passing) {
        setErrorMsgs(arr);
        setError(true);
      }
      return passing;
    }
    const submit = () => {
      clearErr();
      setErrorMsgs([]);
      setError(false);
      if(!checkInput()){
        console.log("Error with data submission: ", errorMsgs)
        return;
      }
      console.log(`Sending forgot password request for user @${tagname} with email ${email}`);
    }

    useEffect(() => {
      dispatch(setTopbarMessage(""))
    }, []);

    return (
            <Container className="h-100 w-100 pb-5" fluid>
              <Row className="p-3 mt-5 text-white lead text-center">
                  <Col className="p-3 text-center, mx-auto pt-5 mt-5 shadow create-account-title"> 
                      <h4 className="text-white create-account-title">Forgotten Password</h4>
                        <InputGroup className="mb-5 mt-3">                      
                          <FormControl
                            placeholder="Enter Your Tagname"
                            aria-label="Enter Your Tagname"
                            aria-describedby="basic-addon1"
                            className={(tagnameInvalid) ? "form-control-error create-account-form-control" : "form-control-normal create-account-form-control"}
                            onChange={ e => { setTagname(e.target.value) }  }
                          />
                        </InputGroup>
                        <InputGroup className="mb-5 mt-3">
                        <FormControl
                          placeholder="Enter Your Email"
                          aria-label="Enter Your Email"
                          aria-describedby="basic-addon1"
                          className={(emailInvalid) ? "form-control-error create-account-form-control" : "form-control-normal create-account-form-control"}
                          onChange={ e => setEmail(e.target.value) }
                        />
                      </InputGroup>
                      <Button onClick={submit} size="lg" className="rounded-pill mb-4 mx-auto" variant="outline-success" block>Reset Password</Button>
                      <Container fluid>
                        <Row>
                          <Col className="mx-auto text-left">
                            <ul className="create-account-error-list" >
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
      );  
}