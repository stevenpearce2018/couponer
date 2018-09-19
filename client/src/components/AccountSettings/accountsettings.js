import React, { Component } from 'react';
import './accountsettings.css';

class AccountSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      address: '',
      cardNumber: '',
      cardholderName: '',
      CCV: '',
      city: '',
      state: '',
      experationDate: '',
      zipCode: '',
      buisnessName: 'off',
      isCustomer: 'off',
      isBuisnessOwner: 'off',
      phoneNumber:''

    };
    // this.updateInput = this.updateInput.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  }

  // updateInputField(event, fieldBeingUpdated) {
  //   this.setState({
  //     [fieldBeingUpdated] : event.target.value
  //   })
  // }

  updatePhoneNumber(event) {
    this.setState({phoneNumber: event.target.value}) 
  }

  updatePassword(event) {
    this.setState({password : event.target.value})
  }
  updateEmail(event) {
    this.setState({email : event.target.value})
  }
  updateAddress(event) {
    this.setState({address : event.target.value})
  }
  updateCardNumber(event) {
    this.setState({cardNumber : event.target.value})
  }
  updateCardholderName(event) {
    this.setState({cardholderName : event.target.value})
  }
  updateCCV(event) {
    this.setState({CCV : event.target.value})
  }
  updateCity(event) {
    this.setState({city : event.target.value})
  }
  updateState(event) {
    this.setState({state : event.target.value})
  }
  updateExperationDate(event) {
    this.setState({experationDate : event.target.value})
  }
  updateZipcode(event) {
    this.setState({zipCode : event.target.value})
  }
  updateBuisnessName(event) {
    this.setState({buisnessName : event.target.value})
  }
  updateIsCustomer(event) {
    this.setState({
      isCustomer : event.target.value,
      isBuisnessOwner: 'off'
    })
  }
  updateIsBuisnessOwner(event) {
    this.setState({
      isBuisnessOwner : event.target.value,
      isCustomer: 'off'
    })
  }
  handleUpdateAccount(e){
    e.preventDefault();
    const url = `api/updateAccount`
    fetch(url, {
      body: this.state,
      method: 'post',
      headers: {
        Accept: 'application/json',
      },
  }).then(response => {
    response.json().then(json => {
        localStorage.setItem('credsCoupon', JSON.stringify(json))
    })
  })
}

  render() {
    return (

      <form className="accountForm" method="post">
      <div className="adjustAccountSettings">
        
        <h2>Account Settings</h2>
          {/* <div className="inputGroup">
            <input id="radio1" name="radio" type="radio" value="checked" checked onChange={this.updateIsCustomer.bind(this)}/>
            <label>Customer</label>
            <input id="radio2" name="radio" type="radio" onChange={this.updateIsBuisnessOwner.bind(this)}/>
            <label> Buisness Owner</label> 
          </div> */}
          </div>
          
        
      
        
        <div className="accountForm">    
          <div className="emailUpdate">
          <label> Email : </label>
          <input type="email" id="email" required onChange={this.updateEmail.bind(this)}/>
          </div>
          
        </div>
          
        <div className="accountForm">
          <div className="passwordUpdate">
          <label> Password : </label>
          <input type="password" id="password" required onChange={this.updatePassword.bind(this)}/>
          </div>
        </div>
          
        <div className="accountForm">
          <div className="phoneUpdate">
          <label> Phone Number : </label>
          <input type="text" id="phoneNumber" required onChange={this.updatePhoneNumber.bind(this)}/>
        </div>
          </div>
        
        <div className="accountForm">
          <div className="adressUpdate">
          <label> Address : </label>
          <input type="text" id="address" required onChange={this.updateAddress.bind(this)}/>
          </div>
        </div>
          
          
        <div className="accountForm">
          <div className="cardNumberUpdate">
          <label> Card Number : </label>
          <input type="text" id="cardNumber" required onChange={this.updateCardNumber.bind(this)}/>
          </div>
        </div>
          
          
        <div className="accountForm">
          <div className="cardholderNameUpdate">
          <label> Cardholder Name : </label>
          <input type="text" id="cardholderName" required onChange={this.updateCardholderName.bind(this)}/>
          </div>
        </div>
          
          
        <div className="accountForm">
          <div className="CCVUpdate">
          <label> CCV : </label>
          <input type="text" id="CCV" required  onChange={this.updateCCV.bind(this)}/>
          </div>
        </div>
          
          
        <div className="accountForm">
          <div className="cityUpdate">
          <label> City : </label>
          <input type="text" id="city" required onChange={this.updateCity.bind(this)}/>
          </div>
        </div>
          
          
        <div className="accountForm">
          <div className="stateUpdate">
          <label> State : </label>
          <input type="text" id="state" required onChange={this.updateState.bind(this)}/>
          </div>
        </div>
          
          
        <div className="accountForm">
          <div className="experationDateUpdate">
          <label> Experation Date(mm/yy) : </label>
          <input type="text" id="experationDate" required onChange={this.updateExperationDate.bind(this)}/>
          </div>
          </div>
          
          
        <div className="accountForm">
          <div className="zipCodeUpdate">
          <label> ZIP Code: </label>
          <input type="text" id="zipCode" required onChange={this.updateZipcode.bind(this)}/>
          </div>
        </div>
          
          
        <div className="accountForm">
          <div className="businessNameUpdate">
          <label className="buisnessOwner"> Buisness Name : </label>
          <input type="text" id="buisnessName" className="buisnessOwner" onChange={this.updateBuisnessName.bind(this)}/>
          </div>
        </div>
          
          
          <button value="send" className="updatebtn" onClick={this.handleUpdateAccount.bind(this)}> Update Info</button>
        </form>
    )
  }
}

export default AccountSettings;
