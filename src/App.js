/*global swal*/

import React, { Component } from 'react';
import logo from './logo.svg';
import loading from './loading.svg';
import './App.css';
import Sound from 'react-sound';
import Button from './Button';

// Not secure, but you can only read my library with this token
const apiToken = `BQBdilD6dG9JGmNA3ocebjEM_cqlP8fYU4j528o3HbZk_NXq5hw7IbW6mn_yBxXU-A3jdZW2YOvZ6AjxXnZBPTOcMkhpg5FHTCNX6t9NsAmMwJz3Y4SopoJj5dCAwxXtx75TCSO-t8bK0Xnu69NWzEJ0`;
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
      libraryFetched: false,
      songsLoaded: false,
      currentTrack: {},
      tracks: [],
      timeout: {},
      apiToken,
      invalidToken: false,
      error: ""
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
    const res = await fetch(`${base_url}?limit=1&offset=${n}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + this.state.apiToken,
      },
    })
      .then(response => response.json())
      if (res.items) {
        return res.items[0].track
      } else {
        throw new Error(res.error ? `error ${res.error.status}: ${res.error.message}` : "unknown error")
      }



  }

  async fetchNewSongs() {
    return await fetch(base_url, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + this.state.apiToken,
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
    this.setState({
      songsLoaded: false
    })
    try {
      await this.setRandomTracksFromAll(this.state.res.total)
      this.setState({
        invalidToken: false
      })
    } catch (e) {
      console.log(e);
      this.setState({
        invalidToken: true,
        error: e.message
      })
    }
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

    console.log("Fetching new tracks")

    const tracks = []
    for (let i = 0; i < nb_song; i++) {
      let track;
      do {
        track = await this.fetchOneSong(getRandomNumber(len_playlist))
      } while (!track.preview_url)

      tracks.push(track)
      console.log(`Got track ${i + 1} out of ${nb_song}`)
    }

    this.setState({
      currentTrack: tracks[getRandomNumber(nb_song)],
      tracks,
      timeout: setTimeout(() => this.resetGame(this.state), timeout_ms),
      songsLoaded: true,
    })

  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      apiToken: event.target.api_token.value,
      libraryFetched: false,
      songsLoaded: false,
    })
    this.componentDidMount()
  }

  async componentDidMount() {

    const res = await this.fetchNewSongs();

    if (res.error && res.error.status === 401) {
      this.setState({
        invalidToken: true,
      })
    } else {
      this.setState({
        invalidToken: false,
        res,
        libraryFetched: true,
        text:
          `Your library has ${res.total} songs !`,
      })
  
      await this.resetGame()
      console.log(this.state)
    }
  }

  render() {
    const token_input = (
      <form onSubmit={(event) => this.handleSubmit(event)} id="token_form">
        <span><a href="https://developer.spotify.com/console/get-current-user-saved-tracks/">Spotify API token</a> : </span>
    <input type="text" id="api_token" name="api_token" placeholder={this.state.apiToken}></input>
        <button type="submit" value="Submit">OK</button>
      </form>)
    const app_control = (<div className="App-images">

      <div>

        <p>{this.state.text}</p>
        <Button onClick={() => this.resetGame()}>New songs</Button>
      </div>
    </div>)
    const loading_element = (<img src={loading} className="App-loading" alt="loading" />)
    const app_button = (
      <div className="App-buttons">
        {
          this.state.tracks.map((track, i) => {
            return <Button onClick={() => this.checkAnswer(track.id)} key={i}>
              <Track track={track} sound={track.id === this.state.currentTrack.id} />
              {/* <b>{track.name}</b> by <i>{track.artists[0].name}</i> */}
            </Button>
          })
        }
      </div>)
    const app_loaded = (<div>
      {app_control}
      {app_button}
    </div>)
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Bienvenue sur le Blindtest</h1>
        </header>
        <main>
          {token_input}

          {this.state.invalidToken ? (<div><h3>Invalid Spotify API Token</h3><p>{this.state.error}</p></div>): 
          (this.state.libraryFetched ? (
            <div>
              <div>
                {app_control}
              </div>
              <div>
                {this.state.songsLoaded ?
                  app_button :
                  loading_element}
              </div>
            </div>
          ) :
            loading_element)
          }
          <div>
            <p>
              Hi this is a blind test from the music of <b>your Spotify</b> music Library. Get a Spotify API Token from the link, and paste it above.
            </p>
          </div>
        </main>

      </div>
    );
  }
}

export default App;
