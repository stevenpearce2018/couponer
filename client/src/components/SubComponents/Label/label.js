import React, { Component } from 'react';


class Label extends Component {
    render() {
      if (this.props.hasLabel === 'true' && this.props.icon) return <label htmlFor={this.props.htmlFor}>{this.props.label} <img className='icon' src={this.props.icon}></img></label>
      if (this.props.hasLabel === 'true') return <label htmlFor={this.props.htmlFor}>{this.props.label}</label>;
    }
}

export default Label;