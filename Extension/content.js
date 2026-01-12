// Check if blocking is enabled
let isBlockingEnabled = true;
const currentHostname = window.location.hostname;

function updateState(enabled) {
    if (enabled) {
        // Check if this specific site is whitelisted
        chrome.storage.local.get(['whitelistedDomains'], (result) => {
            const whitelisted = result.whitelistedDomains || [];
            if (whitelisted.includes(currentHostname)) {
                isBlockingEnabled = false;
                console.log('[Autoplay Blocker] Logic disabled for whitelisted site:', currentHostname);
                document.documentElement.setAttribute('data-autoplay-blocker-enabled', 'false');
            } else {
                isBlockingEnabled = true;
                document.documentElement.setAttribute('data-autoplay-blocker-enabled', 'true');
                scanAndBlock(document);
                recordSiteHistory();
            }
        });
    } else {
        isBlockingEnabled = false;
        document.documentElement.setAttribute('data-autoplay-blocker-enabled', 'false');
    }
}

function recordSiteHistory() {
    chrome.storage.local.get(['blockedSitesHistory'], (result) => {
        const history = result.blockedSitesHistory || [];
        if (!history.includes(currentHostname)) {
            history.push(currentHostname);
            // Limit history to last 50 sites to prevent unbounded growth
            if (history.length > 50) history.shift();
            chrome.storage.local.set({ blockedSitesHistory: history });
        }
    });
}

chrome.storage.local.get(['blockingEnabled'], (result) => {
    const enabled = result.blockingEnabled !== undefined ? result.blockingEnabled : true;
    updateState(enabled);
});

// Update state when changed in popup
chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockingEnabled) {
        updateState(changes.blockingEnabled.newValue);
    }
    // Also listen for whitelist changes to update immediately without reload
    if (changes.whitelistedDomains) {
        chrome.storage.local.get(['blockingEnabled'], (result) => {
            const enabled = result.blockingEnabled !== undefined ? result.blockingEnabled : true;
            updateState(enabled);
        });
    }
});

/**
 * Cleanup / Safety logic
 * Note: MutationObserver and polling are still useful as fallbacks 
 * for 'autoplay' attributes which don't trigger play() calls.
 */

function processVideo(video) {
    if (!isBlockingEnabled) return;
    if (video.dataset.userInteracted === 'true') return;

    if (video.hasAttribute('autoplay')) {
        video.removeAttribute('autoplay');
        video.pause();
    }

    if (!video.paused || video.readyState > 2) {
        video.pause();
    }
}

function scanAndBlock(root) {
    if (!isBlockingEnabled) return;
    if (root.tagName === 'VIDEO') processVideo(root);
    if (root.querySelectorAll) {
        root.querySelectorAll('video').forEach(processVideo);
    }
}

const observer = new MutationObserver((mutations) => {
    if (!isBlockingEnabled) return;
    mutations.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && scanAndBlock(n)));
});
observer.observe(document.documentElement, { childList: true, subtree: true });

setInterval(() => isBlockingEnabled && scanAndBlock(document), 1000);

/**
 * User Interaction Tracking & Activation Window
 */

let activationTimeout = null;

function markAsInteracted(target) {
    const video = target.tagName === 'VIDEO' ? target : target.closest('video');
    if (video) {
        video.dataset.userInteracted = 'true';
        video.play().catch(() => { });
    }

    // Open the 1-second "Global Activation" window for ANY interaction
    document.documentElement.setAttribute('data-user-activated', 'true');
    if (activationTimeout) clearTimeout(activationTimeout);

    activationTimeout = setTimeout(() => {
        document.documentElement.removeAttribute('data-user-activated');
    }, 2000); // Increased to 2s for safety
}

// "Bless" any video that starts playing while the user is active
// This ensures that if we clicked an overly (not the video), the video eventually gets whitelisted
window.addEventListener('playing', (event) => {
    const video = event.target;
    if (video.tagName !== 'VIDEO') return;

    // If the global "User Active" flag is on, we permanently whitelist this video
    if (document.documentElement.getAttribute('data-user-activated') === 'true') {
        video.dataset.userInteracted = 'true';
        console.log('[Autoplay Blocker] Video whitelisted due to active user window:', video);
    }
}, true);

document.addEventListener('click', e => markAsInteracted(e.target), true);
document.addEventListener('mousedown', e => markAsInteracted(e.target), true);
document.addEventListener('keydown', e => {
    // Treat any keypress as activation
    markAsInteracted(document.activeElement || document.body);
}, true);
