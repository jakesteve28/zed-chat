import React, { useState, useRef } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

export default function({ handleSetBackgroundImage }) {
    const [bg, setBG] = useState("");
    const [tint, setTint] = useState("");
    const [color, setColor] = useState("")
    const [error, setError] = useState(false);
    const errorMsgs = useRef([]);
    const checkInput = () => {
        return true;
    }
    const submit = () => {
        setError(false);
        errorMsgs.current = [];
        if(!checkInput()) {
            console.log("Error with background", errorMsgs);
            return;
        }
    }
    return (
        <div style={{
                position: 'fixed',
                width: 325,
                height: 300,
                borderRadius: "15px",
                opacity: 0.8,
                backgroundColor: "#252525",
                top: "30%",
                left: "40%",
                color: "#CCCCCC",
            }}>
            <Container fluid>
                <Row className="pt-5 pb-2">
                    <Col style={{ borderBottom: "1px solid #303030 "}} xs="10" className="mx-auto text-center pt-2 pb-2">
                        <PhotoLibraryIcon style={{ width: 50, height: 50 }} ></PhotoLibraryIcon>
                    </Col>
                </Row>
                <Row className="pt-1 pb-1">
                    <Col className="mx-auto text-center">Drag and Drop Below or&nbsp;<span className="text-primary font-italic" style={{ cursor: "pointer" }}>Upload an Image</span></Col>
                </Row>
                <Row>
                {
                    (error) ?      
                    <Col className="mx-auto text-center">
                        <ul className="text-danger lead">
                            {
                                errorMsgs.current.map(error => <li key={error}>{error}</li>)
                            }
                        </ul>
                    </Col>                
                    : ""
                } 
                </Row>
            </Container>
        </div>
    )
}