import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const interceptDeprecation = (originalFn) => (...args) => {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('THREE.Clock: This module has been deprecated') || args[0].includes('THREE.THREE.Clock: This module has been deprecated'))) {
        return;
    }
    originalFn(...args);
};

console.warn = interceptDeprecation(console.warn);
console.error = interceptDeprecation(console.error);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
