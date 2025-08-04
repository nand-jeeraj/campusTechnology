import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import SocialApp from './SocialApp';
import AttendanceApp from './AttendanceApp';
import AuthApp from './AuthApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
const path = window.location.pathname;

if (path.startsWith('/discussions')) {
  root.render(
    <BrowserRouter>
      <SocialApp />
    </BrowserRouter>
  );
}
else if (path.startsWith('/attendance')) {
  root.render(
    <BrowserRouter>
      <AttendanceApp />
    </BrowserRouter>
  );
}
else if (path.startsWith('/auth')){
  root.render(
    <BrowserRouter>
      <AuthApp />
    </BrowserRouter>
  );
}
else {
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}