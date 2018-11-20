import React, { Component } from 'react';
import './footer.css';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    }
  render() {
    return (
      <div>
        <footer>
            <ul className="social">
                <li><a href="https://twitter.com/mayursuthar2693"><i className="icon-twitter"></i> <span className="sr-only">Visit our twitter</span></a></li>
                <li><a href="https://www.facebook.com/mayursuthar2693"><i className="icon-facebook"></i><span className="sr-only">Visit our facebook</span></a></li>
                <li><a href="https://www.linkedin.com/in/sutharmayur"><i className="icon-linkedin"></i><span className="sr-only">Visit our linkedin</span></a></li>
                <li><a href="https://www.pinterest.com/MayurSuthar2693/"><i className="icon-pinterest"></i><span className="sr-only">Visit our pinterest</span></a></li>
                <li><a href="https://plus.google.com/109916819421919014146/posts"><i className="icon-google-plus"></i><span className="sr-only">Visit our Google plus</span></a></li>
                <li><a href="https://www.instagram.com/mayursuthar2693/"><i className="icon-instagram"></i><span className="sr-only">Visit our instagram</span></a></li>
            </ul>
        </footer>
      </div>
    );
  }
}

export default Footer