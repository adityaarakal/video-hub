import React from 'react';
import './App.css';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import VideoDetails from './components/VideoDetails';
import CommentsSection from './components/CommentsSection';
import RecommendedVideos from './components/RecommendedVideos';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="watch-container">
        <div className="primary-column">
          <VideoPlayer />
          <VideoDetails />
          <CommentsSection />
        </div>
        <div className="secondary-column">
          <RecommendedVideos />
        </div>
      </div>
    </div>
  );
}

export default App;

