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
                <li><a href="https://twitter.com/mayursuthar2693" ><i className="icon-twitter"></i></a></li>
                <li><a href="https://www.facebook.com/mayursuthar2693" ><i className="icon-facebook"></i></a></li>
                <li><a href="https://www.linkedin.com/in/sutharmayur" ><i className="icon-linkedin"></i></a></li>
                <li><a href="https://www.pinterest.com/MayurSuthar2693/" ><i className="icon-pinterest"></i></a></li>
                <li><a href="https://plus.google.com/109916819421919014146/posts" ><i className="icon-google-plus"></i></a></li>
                <li><a href="https://www.instagram.com/mayursuthar2693/" ><i className="icon-instagram"></i></a></li>
            </ul>
        </footer>
      </div>
    );
  }
}

export default Footer