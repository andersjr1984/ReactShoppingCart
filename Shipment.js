import React from "react";

import firebase from "../../Firebase";

import { Button, Form, Col } from 'react-bootstrap';

const states = [
  "AL",  "AK",  "AS",  "AZ",  "AR",  "CA",  "CO",  "CT",
  "DE",  "DC",  "FM",  "FL",  "GA",  "GU",  "HI",  "ID",
  "IL",  "IN",  "IA",  "KS",  "KY",  "LA",  "ME",  "MH",
  "MD",  "MA",  "MI",  "MN",  "MS",  "MO",  "MT",  "NE",
  "NV",  "NH",  "NJ",  "NM",  "NY",  "NC",  "ND",  "MP",
  "OH",  "OK",  "OR",  "PW",  "PA",  "PR",  "RI",  "SC",
  "SD",  "TN",  "TX",  "UT",  "VT",  "VI",  "VA",  "WA",
  "WV",  "WI",  "WY"];

//create a stateless component to display the shopping cart items
export const Shipment = props => {
  return (
    <div className="shoppingCart" onClick={(e) => props.lockScroll(e)}>
      <h3>
        Enter Your Shipping Details Below. We can only ship inside the US.
      </h3>
      <UseDefault userId={props.userId} pwintyId={props.pwintyId} payment={props.payment} />
      <ShipmentForm pwintyId={props.pwintyId} payment={props.payment} userId={props.userId} />
    </div>
  );
};

class UseDefault extends React.Component {
  constructor(props) {
    super(props)
    this.state = {DefaultAddr:{}}
  }

  handleSubmit = async () => {
    //1. create a reference to where the shipment info will be stored in database
    const userRef = firebase.firestore().collection('User/').doc(this.props.userId);
    if (this.props.pwintyId){
      //2. function to update shipment info to order data
      try {
        //2a. push items to database
        //todo: add push to database if shipment info is default for userData
        const dbResponse = await userRef.collection('/CurrentOrder').doc('shipmentInfo').update(this.state.DefaultAddr);
        this.props.payment();
        return dbResponse;
      } catch (error) {
        console.error(error);
        alert('There seems to have been an issue creating your order.  Please try again.')
        //2b. if there is an error, return error
        return error;
      }
    } else {
      //2. create shipment info and pwinty order
      try {
        //2a. push items to database
        //todo: add push to database if shipment info is default for userData
        const dbResponse = await userRef.collection('/CurrentOrder').doc('shipmentInfo').set(this.state.DefaultAddr);
        this.props.payment();
        return dbResponse;
      } catch (error) {
        console.error(error);
        alert('There seems to have been an issue creating your order.  Please try again.')
        //2b. if there is an error, return error
        return error;
      }
    }
  };

  componentDidMount = async () => {
    //1. Check to see if there is a default address in database
    const reference = firebase.firestore().collection('User/').doc(this.props.userId).collection('UserInfo/').doc('DefaultAddr');
    //2. Pull default address from database
    const defAddrData = await reference.get();
    //3. Convert Default address
    const defAddr = defAddrData.data()
    //4. Check to see if there is any info in the default address
    if(defAddr !== {}){
      //5. if there is, set the state for a re-render
      this.setState({DefaultAddr:defAddr})
    }
  }

  render () {
    //create an array of keys
    const keys = Object.keys(this.state.DefaultAddr);
    //1. return an option to use the default address
    //only if there are any keys in the default address item
    if (keys.length !== 0) {
      return (
        <Button className="submitButton" onClick={(e)=>this.handleSubmit()}>
          Use Default:<br/>
          {this.state.DefaultAddr.recipientName}<br/>
          {this.state.DefaultAddr.address1}<br/>
          {this.state.DefaultAddr.address2!=="" && this.state.DefaultAddr.address2}
          {this.state.DefaultAddr.address2!=="" && <br/>}
          {this.state.DefaultAddr.addressTownOrCity}, {this.state.DefaultAddr.stateOrCounty} {this.state.DefaultAddr.postalOrZipCode}<br/>
        </Button>
      )
    }
    //1a. No default address specified. 
    else {return null}
  }
}

class SubmitButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        hasSubmitted: false,
        message: "Submit"
    }
    this.handleSubmission = this.handleSubmission.bind(this);
  }

  handleSubmission = (defAddr) => {
    this.setState({hasSubmitted: true});
    this.props.handleSubmit(defAddr)
  }

  validate(defAddr){
    if (this.props.canSubmit) {this.handleSubmission(defAddr)}
    else {this.setState({message: "Form not valid! Click again when ready."})}
  }
  
  render() {
    if (this.state.hasSubmitted) {
      return (
        <div className="submitButton">
          Waiting on the Clouds . . .
        </div>
      )
    } else {
      return (
        <div>
          <Button className="submitButton" onClick={(e)=>this.validate(false)}>
            Use Once<br/>
            {this.state.message}
          </Button>
          <br/>
          <Button className="submitButton" onClick={(e)=>this.validate(true)}>
            Set As Default<br/>
            {this.state.message}
          </Button>
        </div>
      )
    }
  }
}

class ShipmentForm extends React.Component {
  //create the state that will be submitted to Pwinty
  constructor(props) {
    super(props);
    this.state = {
      countryCode: "US",
      recipientName: "",
      address1: "",
      address2: "",
      addressTownOrCity: "",
      stateOrCounty: "AL",
      postalOrZipCode: "",
      preferredShippingMethod: "Budget",
      email: ""
    };

    this.handleUserInput = this.handleUserInput.bind(this);
    this.validate = this.validate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUserInput(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name]: value
    });
  }

  //create all the State options from the State array
  stateList = states.map((state, index) => (
    <option key={index}>{state}</option>
  ));

  handleSubmit = async (defAddr) => {
    //1. create a reference to where the shipment info will be stored in database
    const userRef = firebase.firestore().collection('User/').doc(this.props.userId);
    if(defAddr){
      userRef.collection('UserInfo/').doc('DefaultAddr').update(this.state);
    }
    if (this.props.pwintyId){
      //2. function to update shipment info to order data
      try {
        //2a. push items to database
        //todo: add push to database if shipment info is default for userData
        const dbResponse = await userRef.collection('/CurrentOrder').doc('shipmentInfo').update(this.state);
        this.props.payment();
        return dbResponse;
      } catch (error) {
        console.error(error);
        alert('There seems to have been an issue creating your order.  Please try again.')
        //2b. if there is an error, return error
        return error;
      }
    } else {
      //2. function to create shipment info and pwinty order
      try {
        //2a. push items to database
        //todo: add push to database if shipment info is default for userData
        const dbResponse = await userRef.collection('/CurrentOrder').doc('shipmentInfo').set(this.state);
        this.props.payment();
        return dbResponse;
      } catch (error) {
        console.error(error);
        alert('There seems to have been an issue creating your order.  Please try again.')
        //2b. if there is an error, return error
        return error;
      }
    }
  };
  

  validate = () => {
    let submit = true;
    Object.keys(this.state).map(i => {
      if (i !== "address2") {
        if (this.state[i] === "") {
          submit = false;
        }
      }
      return null;
    });
    return submit;
  };

  componentDidMount = async () => {
    if(this.props.pwintyId!==''){
      //1. create a reference to where the shipment info is stored in database
      const userRef = firebase.firestore().collection('User/').doc(this.props.userId);
      const shippingData = await userRef.collection('CurrentOrder/').doc('shipmentInfo').get()
      if(shippingData.exists){
        this.setState(shippingData.data());
      }
    }
  };

  render() {
    return (
      <Form>
        <Form.Row>
          <Col sm={2}>
            <Form.Label id="recipientName">
              Recipient Name:
            </Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="text"
              name="recipientName"
              value={this.state.recipientName}
              onChange={event => this.handleUserInput(event)}
            />
          </Col>
        </Form.Row>
        
        <Form.Row>
          <Col sm={2}>
            <Form.Label>
              Address 1:
            </Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="text"
              name="address1"
              value={this.state.address1}
              onChange={event => this.handleUserInput(event)}
            />
          </Col>
        </Form.Row>
        
        <Form.Row>
          <Col sm={2}>
            <Form.Label>
              Address 2:
            </Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="text"
              name="address2"
              value={this.state.address2}
              onChange={event => this.handleUserInput(event)}
            />
          </Col>
        </Form.Row>
        
        <Form.Row>
          <Col sm={2}>
            <Form.Label>
              City, State:
            </Form.Label>
          </Col>
          <Col sm={6}>
            <Form.Control
              type="text"
              name="addressTownOrCity"
              className="city"
              value={this.state.addressTownOrCity}
              onChange={event => this.handleUserInput(event)}
            />
          </Col>
          <Col sm={1}>
            <Form.Control
              as="select"
              name="stateOrCounty"
              value={this.state.stateOrCounty}
              onChange={event => this.handleUserInput(event)}
            >
              {this.stateList}
            </Form.Control>
          </Col>
        </Form.Row>
        
        <Form.Row>
          <Col sm={2}>
            <Form.Label>
              ZipCode:
            </Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="text"
              name="postalOrZipCode"
              value={this.state.postalOrZipCode}
              onChange={event => this.handleUserInput(event)}
            />
          </Col>
        </Form.Row>
        
        <Form.Row>
          <Col sm={2}>
            <Form.Label>
              eMail:
            </Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="text"
              name="email"
              value={this.state.email}
              onChange={event => this.handleUserInput(event)}
            />
          </Col>
        </Form.Row>
        <SubmitButton handleSubmit={this.handleSubmit} canSubmit={this.validate()} />
      </Form>
    );
  }
}
