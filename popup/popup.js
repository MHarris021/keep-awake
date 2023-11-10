
document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.getElementById('toggleAwake');
    var disableScheduleCheckbox = document.getElementById('disableSchedule');
    var setScheduleButton = document.getElementById('setSchedule');
    var clearScheduleButton = document.getElementById('clearSchedule');
    var startTimeInput = document.getElementById('startTime');
    var endTimeInput = document.getElementById('endTime');

    // Load the initial state of the checkbox and the schedule
    chrome.storage.local.get(['keepAwakeEnabled', 'disableSchedule', 'startTime', 'endTime'], function(result) {
        checkbox.checked = result.keepAwakeEnabled || false;
        disableScheduleCheckbox.checked = result.disableSchedule || false;
        startTimeInput.value = result.startTime || '';
        endTimeInput.value = result.endTime || '';
    });

    // Add a listener for when the checkbox changes
    checkbox.addEventListener('change', function() {
        chrome.runtime.sendMessage({message: "toggle", state: checkbox.checked}, function(response) {
            console.log(response.status);
        });
    });

    // Add a listener for when the disable schedule checkbox changes
    disableScheduleCheckbox.addEventListener('change', function() {
        chrome.runtime.sendMessage({message: "toggleDisableSchedule", state: disableScheduleCheckbox.checked}, function(response) {
            console.log('Disable schedule set to: ' + response.state);
            startTimeInput.disabled = disableScheduleCheckbox.checked;
            endTimeInput.disabled = disableScheduleCheckbox.checked;
            setScheduleButton.disabled = disableScheduleCheckbox.checked;
            clearScheduleButton.disabled = disableScheduleCheckbox.checked;
        });
    });

    // Add a listener for when the Set Schedule button is clicked
    setScheduleButton.addEventListener('click', function() {
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        // Save the schedule times
        chrome.storage.local.set({startTime: startTime, endTime: endTime}, function() {
            console.log('Schedule set:', startTime, endTime);
            // Send a message to the background page to update the alarm
            chrome.runtime.sendMessage({message: "setSchedule"}, function(response) {
                if(response.status === "scheduleSet") {
                    // Show a success message
                    alert('Schedule has been set: ' + startTime + ' to ' + endTime);
                }
                console.log(response.status);
            });
        });
    });

    // Add a listener for when the Clear Schedule button is clicked
    clearScheduleButton.addEventListener('click', function() {
        // Clear the schedule times
        chrome.storage.local.remove(['startTime', 'endTime'], function() {
            startTimeInput.value = '';
            endTimeInput.value = '';
            // Send a message to the background page to clear the alarm
            chrome.runtime.sendMessage({message: "clearSchedule"}, function(response) {
                if (response.status === "scheduleCleared") {
                    // Show a success message
                    alert('Schedule has been cleared.');
                }
                console.log(response.status);
            });
        });
    });
});