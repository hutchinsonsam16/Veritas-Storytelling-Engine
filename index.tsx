// --- Environment Configuration ---
// This must run before any other code to prevent @xenova/transformers
// from trying to access the local filesystem in a browser-like environment.
import { env } from '@xenova/transformers';
env.allowLocalModels = false;
env.useBrowserCache = true;

// --- React App Initialization ---
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
