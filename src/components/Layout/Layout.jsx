import React from 'react';
import TrackList from '../TrackList/TrackList';
import Player from '../Player/Player';

const Layout = () => {
    return (
        <div className="flex h-screen">
            <div className="w-1/3 p-4 border-r">
                <Player />
            </div>
            <div className="w-2/3 p-4">
                <TrackList />
            </div>
        </div>
    );
};

export default Layout;