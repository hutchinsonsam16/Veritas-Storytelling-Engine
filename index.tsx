import { env } from '@xenova/transformers';
import { Buffer } from 'buffer';

// --- Polyfills & Environment Configuration ---

// Polyfill Buffer for the @google/genai SDK. This is necessary for it to function in a browser environment.
// @ts-ignore
window.Buffer = Buffer;

// HACK: Force transformers.js to run in browser mode.
// This must be done at the application entry point to ensure it runs before the library is used anywhere else.
// It prevents the library from incorrectly detecting a Node.js environment and trying to access the local filesystem.
// @ts-ignore
env.isNode = false;
env.useBrowserCache = true;
env.allowLocalModels = false;

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
