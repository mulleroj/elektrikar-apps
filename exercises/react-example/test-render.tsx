import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.tsx';

try {
  const html = renderToString(<App />);
  console.log("Render successful. Length:", html.length);
} catch (e) {
  console.error("Render failed:", e);
}
