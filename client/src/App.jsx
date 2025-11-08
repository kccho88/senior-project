import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Album from './pages/Album';
import BookView from './pages/BookView';
import AudioBook from './pages/AudioBook';

function App() {
  return (
    <Router basename="/senior-project">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/album" element={<Album />} />
        <Route path="/book" element={<BookView />} />
        <Route path="/audiobook" element={<AudioBook />} />
      </Routes>
    </Router>
  );
}

export default App;


