import {  createApp } from 'vue';
import './style.css';
import App from './App.vue';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

createApp(App).mount('#app');

// The wake lock sentinel.
let wakeLock = null;

(async () => {
    try {
        // Function that attempts to request a screen wake lock.
        const requestWakeLock = async () => {
            try {
            wakeLock = await navigator.wakeLock.request();
            wakeLock.addEventListener('release', () => {
                console.log('Screen Wake Lock released:', wakeLock.released);
            });
            console.log('Screen Wake Lock released:', wakeLock.released);
            } catch (err) {
            console.error(`${err.name}, ${err.message}`);
            }
        };
        
        // Request a screen wake lock…
        await requestWakeLock();
        // …and release it again after 1 hour
        window.setTimeout(() => {
            wakeLock.release();
            wakeLock = null;
        }, 3600000);
    } catch (e) {
        // Deal with the fact the chain failed
    }
    // `text` is not available here
})();

