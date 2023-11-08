
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ keepAwakeEnabled: false, disableSchedule: false });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkSchedule') {
        checkSchedule();
    }
});

function checkSchedule() {
    chrome.storage.local.get(['keepAwakeEnabled', 'disableSchedule', 'startTime', 'endTime'], function(result) {
        if (result.keepAwakeEnabled) {
            chrome.power.requestKeepAwake('display');
            return;
        }

        if (!result.disableSchedule) {
            const now = new Date();
            const start = new Date();
            const end = new Date();
            const [startHours, startMinutes] = result.startTime.split(':').map(Number);
            const [endHours, endMinutes] = result.endTime.split(':').map(Number);
            start.setHours(startHours, startMinutes);
            end.setHours(endHours, endMinutes);

            // Check if the current time is within the schedule
            if (now >= start && now <= end) {
                chrome.power.requestKeepAwake('display');
            } else {
                chrome.power.releaseKeepAwake();
            }
        } else {
            chrome.power.releaseKeepAwake();
        }
    });
}

function createAlarm() {
    chrome.alarms.create('checkSchedule', {periodInMinutes: 1});
}

function clearAlarm() {
    chrome.storage.local.get(['keepAwakeEnabled', 'startTime', 'endTime'], function(result) {
        if(!result.keepAwakeEnabled&& (!result.startTime && !result.endTime)) {
            chrome.alarms.clear('checkSchedule');
        }
    });
}

function toggleKeepAwake(state) {
    chrome.storage.local.set({ keepAwakeEnabled: state }, function() {
        if(state){
            createAlarm();
        }
    });
}

// Listen for a message from the options page
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "toggle") {
            toggleKeepAwake(request.state);
            sendResponse({status: "success"});
        } else if (request.message === "setSchedule") {
            createAlarm();
            sendResponse({status: "scheduleSet"});
        } else if (request.message === "clearSchedule") {
            clearAlarm();
            sendResponse({status: "scheduleCleared"});
        } else if (request.message === "toggleDisableSchedule") {
            chrome.storage.local.set({ disableSchedule: request.state });
            sendResponse({status: "success"});
        }
    }
);