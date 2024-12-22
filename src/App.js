import React from 'react';
import { PlayerProvider } from './contexts/PlayerContext';
import Layout from './components/Layout/Layout';

function App() {
  return (
      <PlayerProvider>
        <Layout/>
      </PlayerProvider>
  );
}

export default App;