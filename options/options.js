
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.set({suspendPulsing: e.target.checked});

// Load preference
    chrome.storage.sync.get('suspendPulsing', function (data) {
        document.getElementById('suspendPulsing').checked = data.suspendPulsing;
        if (data.suspendPulsing) {
            document.body.classList.add('pulsing-disabled');
        }
    });
});