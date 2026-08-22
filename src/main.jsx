import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import 'leaflet/dist/leaflet.css';
import './estilos/tokens.css';
import './estilos/app.css';
import './estilos/paineis.css';
import './estilos/impressao.css';

import App from './App.jsx';

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
