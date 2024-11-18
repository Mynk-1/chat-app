import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './components/Auth/LoginForm.js';
import MainSection from './components/chatSection/mainSection.js';
import { ContactProvider } from './Context/ContactContext.js';
import LandingPage from './components/LandingPage/LandingPage.js';


const App = () => {
  return (
    
    <BrowserRouter><ContactProvider>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<MainSection/>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes></ContactProvider>
  </BrowserRouter>
  
  )
}

export default App