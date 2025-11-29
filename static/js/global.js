const offlineIcon = document.getElementById('offline_icon');

function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineIcon.style.display = 'none';
    } else {
        offlineIcon.style.display = 'block';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
updateOnlineStatus();

