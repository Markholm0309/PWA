// Checks if browser supports service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Service worker registered', reg))
        .catch((error) => console.log('Service worker not registered', error))
}
