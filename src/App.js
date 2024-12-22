import React from 'react';
import { PlayerProvider } from './contexts/PlayerContext';
import Layout from './components/Layout/Layout';
import Player from './components/Player/Player';
import TrackList from './components/TrackList/TrackList';

function App() {
  return (
      <PlayerProvider>
        <Layout>
          <Player />
          <TrackList />
        </Layout>
      </PlayerProvider>
  );
}

export default App;