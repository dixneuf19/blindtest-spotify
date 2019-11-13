/*global swal*/

import React, { Component } from 'react';
import logo from './logo.svg';
import loading from './loading.svg';
import './App.css';
import Sound from 'react-sound';
import Button from './Button';

// Not secure, but you can only read my library with this token
const apiToken = `BQCaG8sdCndUjvnQLzGbPkUrqorRLhAY3mI43xjGskqy353zr7NgRrYAjiiJXNZ2eQ0vVvVo-ROkUj6kFv3fwHE_ClFVyeS950hdsmWw5F5G7pBEj07lWGhHWmvB-6hyb75bGWy7wjrq9Rc1mxop6uDt`;

function shuffleArray(array) {
  let counter = array.length;

  while (counter > 0) {
    let index = getRandomNumber(counter);
    counter--;
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

/* Return a random number between 0 included and x excluded */
function getRandomNumber(x) {
  return Math.floor(Math.random() * x);
}

class App extends Component {

  constructor() {
    super();
    this.state = {
      text: ""
    }
  }

  async componentDidMount() {
    this.setState({
      text: "Bonjour"
    })

    const res = await fetch('https://api.spotify.com/v1/me/tracks', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + apiToken,
      },
    })
      .then(response => response.json())

    this.setState({
      text: `Your library has ${res.total} songs !`
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Bienvenue sur le Blindtest</h1>
        </header>
        <div className="App-images">
          <p>{this.state.text}</p>
        </div>
        <div className="App-buttons">
        </div>
      </div>
    );
  }
}

export default App;
