/*global swal*/

import React, { Component } from 'react';
import logo from './logo.svg';
import loading from './loading.svg';
import './App.css';
import Sound from 'react-sound';
import Button from './Button';

// Not secure, but you can only read my library with this token
const apiToken = `BQAZgmJvGImzoBL6E1_Hl43Oi91pLzGRwi1h5RIiby2T_1CgGCqg_yj-E4w2Ce4A-njFLzh11X71BM_fSA_ZcCAH1hrel9b0MQ5t9oWdr9Pf-td4XdN32rD6Vr2HL-_qL5znjHaoOkLSUi7Htau3taah`;
const nb_song = 3;

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

class Track extends Component {



  render() {

    // console.log(this.props)
    if (!this.props.track) {
      return (<div><b>No song fetch</b></div>)
    } else {
      return (
        <div><div>
          <b>{this.props.track.name}</b> by <b>{this.props.track.artists[0].name}</b>
        </div>
        <div>
        {this.props.sound ? <Sound url={this.props.track.preview_url} playStatus={Sound.status.PLAYING}/> : <div></div>}
        </div>
          <div>
            <AlbumCover images={this.props.track.album.images} />
          </div>
        </div>)
    }
  }


}

class AlbumCover extends Component {

  // const props = {
  //   images = [{
  //     url: ""
  //   }],
  //   ...this.props
  // }

  render() {
    const src = this.props.images[0].url; // A changer ;)
    return (<img src={src} style={{ width: 400, height: 400 }} />);
  }
}
class App extends Component {

  constructor() {
    super();
    this.state = {
      text: "",
      songsLoaded: false,
      currentTrack: {},
      tracks: [],
      timeout: {}
    }
  }

  async checkAnswer(id) {
      if (id === this.state.currentTrack.id) {
        clearTimeout(this.state.timeout)
        await swal("Bravo", `It was ${this.state.currentTrack.name} by ${this.state.currentTrack.artists[0].name}`, "succes")
        this.setNewRandomTracks();
      } else {
        swal("Nope.", `It was ${this.state.currentTrack.name} by ${this.state.currentTrack.artists[0].name}`, "warning")
      }
  }

  async fetchNewSongs() {
     return await fetch('https://api.spotify.com/v1/me/tracks', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + apiToken,
      },
    })
      .then(response => response.json())

  }

  getShuffledTracks(res, max) {
    return shuffleArray(res.items.map(e => e.track)).filter((_, i) => i < max) 
  }

  resetGame() {
    this.setNewRandomTracks()
  }

  setNewRandomTracks() {
    const tracks = this.getShuffledTracks(this.state.res, nb_song)

    this.setState({
      currentTrack: tracks[getRandomNumber(nb_song)],
      tracks,
      timeout: setTimeout(this.reset, 1000)
    })
  }

  async componentDidMount() {

    const res = await this.fetchNewSongs();

    this.setState({
      res
    })

    this.setNewRandomTracks()

    this.setState({
      songsLoaded: true,
      text:
        `Your library has ${res.total} songs ! Here I've got ${res.items.length} songs loaded.`,
      
    })

    console.log(this.state)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Bienvenue sur le Blindtest</h1>
        </header>
        <div className="App-images">
          {this.state.songsLoaded ?
            <div>
              <p>{this.state.text}</p>
              <Button onClick={() => this.setNewRandomTracks()}>New songs</Button>
              
            </div> :
            <img src={loading} className="App-loading" alt="loading" />}

        </div>
        <div className="App-buttons">
          {
            this.state.tracks.map((track, i) => {
              return <Button onClick={() => this.checkAnswer(track.id)} key={i}>
                <Track track={track} sound={track.id === this.state.currentTrack.id}/>
                {/* <b>{track.name}</b> by <i>{track.artists[0].name}</i> */}
                </Button>
            })
          }
        </div>
      </div>
    );
  }
}

export default App;
