/*global swal*/

import React, { Component } from 'react';
import logo from './logo.svg';
import loading from './loading.svg';
import './App.css';
import Sound from 'react-sound';
import Button from './Button';

// Not secure, but you can only read my library with this token
const apiToken = `BQAqRaOriEd_SMYMWX-yodxfbYatkAj4tU8Fgfi9K9czfqt6N4N-irOtx2d-FxaQNzXZxpv4Xki2hxAe7C8MmUonrYShs-_cTiENxp7bWlFwQa9gCgc2tdBGzPsaCU9ShgBeFuSeAEIn_YjgTvKf0pkt`;
const nb_song = 3;
const base_url = `https://api.spotify.com/v1/me/tracks`;
const timeout_ms = 30000

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
            {this.props.sound ? <Sound url={this.props.track.preview_url} playStatus={Sound.status.PLAYING} /> : <div></div>}
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
      await this.resetGame();
    } else {
      swal("Nope.", `It was ${this.state.currentTrack.name} by ${this.state.currentTrack.artists[0].name}`, "warning")
    }
  }

  async fetchOneSong(n) {
    const track = await fetch(`${base_url}?limit=1&offset=${n}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + apiToken,
      },
    })
      .then(response => response.json()).then(res => res.items[0].track)


    return track.preview_url ? track :this.fetchOneSong(n)
    
  }

  async fetchNewSongs() {
    return await fetch(base_url, {
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

  async timeout(state) {
    await swal("Too long !", `It was ${this.state.currentTrack.name} by ${this.state.currentTrack.artists[0].name}`, "warning")
    this.resetGame()
  }

  async resetGame() {
    console.log(`new songs with ${this.state.res.total}`)
    await this.setRandomTracksFromAll(this.state.res.total)
  }

  setNewRandomTracks() {
    const tracks = this.getShuffledTracks(this.state.res, nb_song)

    this.setState({
      currentTrack: tracks[getRandomNumber(nb_song)],
      tracks,
      timeout: setTimeout(() => this.resetGame(this.state), timeout_ms)
    })
  }

  async setRandomTracksFromAll(len_playlist) {

    const tracks = []
    for (let i = 0; i < nb_song; i++) {
      const track = await this.fetchOneSong(getRandomNumber(len_playlist))
      tracks.push(track)
    }

    this.setState({
      currentTrack: tracks[getRandomNumber(nb_song)],
      tracks,
      timeout: setTimeout(() => this.resetGame(this.state), timeout_ms)
    })

  }

  async componentDidMount() {

    const res = await this.fetchNewSongs();

    this.setState({
      res
    })

    this.setRandomTracksFromAll(this.state.res.total)

    this.setState({
      songsLoaded: true,
      text:
        `Your library has ${res.total} songs !`,

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
                <Track track={track} sound={track.id === this.state.currentTrack.id} />
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
