import React, { useState } from 'react'
import {  Button, InputGroup, FormControl, Container, Row, Col } from 'react-bootstrap'
import regex from '../regex';
import './createaccount.css';
import useWindowSize from '../sidebar/windowSize';

export default function ForgotPassword(){
    const [email, setEmail] = useState("");
    const [tagname, setTagname] = useState("");
    const [error, setError] = useState(false);
    const [errorMsgs, setErrorMsgs] = useState([]);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [tagnameInvalid, setTagnameInvalid] = useState(false);
    const size = useWindowSize();
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
    return (
            <Container className="h-100 w-100 pb-5" fluid>
              <Row className="p-3 mt-5 text-white lead text-center">
                  <Col className="p-3 text-center, mx-auto pt-5 mt-5 shadow" style={{ borderRadius: "15px", backgroundColor: "#191919", opacity: 0.6, maxWidth: "500px"}}> 
                      <h4 className="text-white" style={{ opacity: 0.8, marginBottom: "35px" }}>Forgotten Password</h4>
                        <InputGroup className="mb-5 mt-3">                      
                          <FormControl
                            style={{ marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px',border: 'none',  backgroundColor: "#404040" }}
                            placeholder="Enter Your Tagname"
                            aria-label="Enter Your Tagname"
                            aria-describedby="basic-addon1"
                            className={(tagnameInvalid) ? "form-control-error" : "form-control-normal"}
                            onChange={ e => { setTagname(e.target.value) }  }
                          />
                        </InputGroup>
                        <InputGroup className="mb-5 mt-3">
                        <FormControl
                          style={{ marginLeft: "auto", marginRight: "auto", color: "white", opacity: 0.87, maxWidth: '400px', minHeight: '50px',border: 'none',  backgroundColor: "#404040" }}
                          placeholder="Enter Your Email"
                          aria-label="Enter Your Email"
                          aria-describedby="basic-addon1"
                          className={(emailInvalid) ? "form-control-error" : "form-control-normal"}
                          onChange={ e => setEmail(e.target.value) }
                        />
                      </InputGroup>
                      <Button onClick={submit} size="lg" className="rounded-pill mb-4 mx-auto" variant="outline-success" style={{ opacity: 0.8, maxWidth: '200px' }} block>Reset Password</Button>
                      <Container fluid style={{ opacity: 1.2 }}>
                        <Row>
                          <Col className="mx-auto text-left">
                            <ul style={{ listStyleType: "none", marginRight: "auto", marginLeft: "auto", paddingRight: "30px" }}>
                              {(error) ?  <li><h6 className="border-bottom pb-2 border-danger text-danger font-weight-bold">Errors</h6></li> : ""}
                              {
                                (error) ? errorMsgs.map(el => (<li className="font-italic lead text-danger">{el}</li>)) : ""
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