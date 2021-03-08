import React, { useState, useRef } from 'react';
import { Container, Dropdown, Row, Button, Accordion, Spinner, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux'; 
import { setBackground } from '../../store/slices/uiSlice';
import Tooltip from '@material-ui/core/Tooltip';
import PanoramaIcon from '@material-ui/icons/Panorama';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import rainier from '../../assets/rainier.jpg';
import hood from '../../assets/hood.jpg';
import helens from '../../assets/sthelens.jpg';
import '../../styles/topbar.css';
import '../../styles/index.css';
export default function EditColorsDropdown() {
    const [colorOpen, setColorOpen] = useState(true);
    const [picOpen, setPicOpen] = useState(false); 
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const timeout = useRef(null);

    const dispatch = useDispatch();
    const setBG = (color) => {
        dispatch(setBackground(color));
    }
    const setBGPic = (link) => {
        dispatch(setBackground(link));
    }
    const setAccent = () => {
        dispatch(setAccent(color));
    }
    const handleUpload = () => {

    }
    return (
      <Dropdown className="ml-3 p-1 topbar-dropdown edit-bg-dropdown" >
          <Tooltip title="Edit Background">
            <Dropdown.Toggle as="button" className="top-dropdown-button font-weight-bold rounded-pill ml-2">
            {
                <PanoramaIcon></PanoramaIcon>
            }
            </Dropdown.Toggle>    
          </Tooltip>   
          <Dropdown.Menu className="edit-bg-dropdown-menu">
            <Dropdown.ItemText className="text-center font-weight-bold lead p-3 pb-2 edit-bg-label"><PanoramaIcon></PanoramaIcon>&nbsp;&nbsp;Edit Background</Dropdown.ItemText>
            <Container fluid className="edit-bg-container">
                <Accordion defaultActiveKey="0">
                    <Card className="accordion-bg-card">
                        <Accordion.Toggle as={Card.Header} eventKey="0" className="accordion-bg-title select-color-border" onClick={() => { setColorOpen(!colorOpen); setPicOpen(false); } }>
                            <span>{(colorOpen) ?  (<KeyboardArrowDownIcon className="accordion-chevron-icon"></KeyboardArrowDownIcon>) : (<ChevronRightIcon className="accordion-chevron-icon"></ChevronRightIcon>)} Select background color</span>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body className="card-body-select-bg">
                                <Row className="select-color-row">
                                    <div className="select-color-square global-dark" onClick={() => setBG("#191919")}></div>
                                    <div className="select-color-square global-green" onClick={() => setBG("#02312e")}></div>
                                    <div className="select-color-square global-blue" onClick={() => setBG("#05396e")}></div>
                                    <div className="select-color-square global-red" onClick={() => setBG("#2c0404")}></div>
                                    <div className="select-color-square global-orange" onClick={() => setBG("#542d00")}></div>
                                    <div className="select-color-square global-magenta" onClick={() => setBG("#330033")}></div>
                                    <div className="select-color-square global-navy" onClick={() => setBG("#000035")}></div>
                                </Row>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    <Card className="accordion-bg-card">
                        <Accordion.Toggle as={Card.Header} eventKey="2" className="accordion-bg-title" onClick={() =>{ setPicOpen(!picOpen); setColorOpen(false); }}>
                            <span>{(picOpen) ? (<KeyboardArrowDownIcon className="accordion-chevron-icon"></KeyboardArrowDownIcon>) : (<ChevronRightIcon className="accordion-chevron-icon"></ChevronRightIcon>)}Select background picture</span>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="2">
                            <Card.Body className="card-body-select-bg">
                                <Row className="select-picture-row">
                                    <div className="select-bg-square hood mx-auto" key="mthood" onClick={() => setBGPic(hood)}>\
                                        <img src={hood} className="select-bg-img" alt="Mt Hood"></img>
                                    </div>
                                    <div className="select-bg-square rainier mx-auto" key="mtrainier" onClick={() => setBGPic(rainier)}>
                                        <img src={rainier} className="select-bg-img" alt="Mt Rainier"></img>
                                    </div>
                                    <div className="select-bg-square sthelens mx-auto" key="mtsthelens" onClick={() => setBGPic(helens)}>
                                        <img src={helens} className="select-bg-img" alt="Mt St Helens"></img>
                                    </div>
                                    <Tooltip title="Click/Drag to Upload">
                                        <Button className="upload-bg-button my-auto mx-auto" onClick={handleUpload}>
                                            <span>
                                                <CloudUploadIcon className="cloud-upload-button" />
                                                {(uploadingPicture) ? (<Spinner variant="secondary" animation="border" style={{ marginLeft: "20px",width: 20, height: 20 }}></Spinner>) : ""}
                                            </span>
                                        </Button>                              
                                    </Tooltip>
                                </Row>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </Container>            
          </Dropdown.Menu>
      </Dropdown>
    );
}
