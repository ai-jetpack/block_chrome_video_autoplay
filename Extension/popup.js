document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleBlocking');
    const statusText = document.getElementById('statusText');
    const siteListContainer = document.getElementById('siteList');

    // Load saved state
    chrome.storage.local.get(['blockingEnabled', 'blockedSitesHistory', 'whitelistedDomains'], (result) => {
        // Global toggle state
        const isEnabled = result.blockingEnabled !== undefined ? result.blockingEnabled : true;
        updateUI(isEnabled);

        // Render site list
        const history = result.blockedSitesHistory || [];
        const whitelist = result.whitelistedDomains || [];
        renderSiteList(history, whitelist);
    });

    toggle.addEventListener('change', () => {
        const isEnabled = toggle.checked;
        chrome.storage.local.set({ blockingEnabled: isEnabled }, () => {
            updateUI(isEnabled);
        });
    });

    function updateUI(isEnabled) {
        toggle.checked = isEnabled;
        statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
        statusText.style.color = isEnabled ? '#2196F3' : '#666';
    }

    function renderSiteList(history, whitelist) {
        if (history.length === 0) return;

        siteListContainer.innerHTML = '';

        // Sort history alphabetically
        history.sort();

        history.forEach(site => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.padding = '5px 0';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '10px';

            // Checked = Blocking Enabled (NOT in whitelist)
            // Unchecked = Blocking Disabled (IN whitelist)
            checkbox.checked = !whitelist.includes(site);

            checkbox.addEventListener('change', () => {
                updateWhitelist(site, !checkbox.checked);
            });

            const label = document.createElement('span');
            label.textContent = site;
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';
            label.title = site;

            row.appendChild(checkbox);
            row.appendChild(label);
            siteListContainer.appendChild(row);
        });
    }

    function updateWhitelist(site, shouldWhitelist) {
        chrome.storage.local.get(['whitelistedDomains'], (result) => {
            let whitelist = result.whitelistedDomains || [];

            if (shouldWhitelist) {
                if (!whitelist.includes(site)) {
                    whitelist.push(site);
                }
            } else {
                whitelist = whitelist.filter(domain => domain !== site);
            }

            chrome.storage.local.set({ whitelistedDomains: whitelist });
        });
    }
});
