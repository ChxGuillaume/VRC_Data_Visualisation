try {
    const websiteUrl = 'http://localhost:3000/';

    setIcon(true);

    chrome.tabs.onActivated.addListener((activeInfo) => {
        checkTabForIcon(activeInfo.tabId)
    })

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        setIcon(!isLoggedUrl(tab.url))
    })

    chrome.action.onClicked.addListener(function (tab) {
        chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        }, function (tabs) {
            const tab = tabs[0];

            if (isLoggedUrl(tab.url)) {
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    function: getCookies
                }, (data) => {
                    const cookies = data[0].result.match(/(apiKey=.*?;)|(auth=.*?;)/gm);

                    if (cookies.length === 2) {
                        chrome.tabs.create({url: `${websiteUrl}setCookie?cookie=${encodeURIComponent(cookies.join(' '))}`})
                    }
                })
            }
        });
    });
} catch (e) {
    console.error(e)
}

function checkTabForIcon(tabId) {
    // Timeout in case of tabs dragging throw
    setTimeout(() => {
        chrome.tabs.get(tabId, (tab) => {
            if (tab) setIcon(!isLoggedUrl(tab.url));
            else checkTabForIcon(tabId);
        });
    }, 100);
}

function getCookies() {
    return document.cookie;
}

function isLoggedUrl(url) {
    return url.startsWith('https://vrchat.com/home') && !url.startsWith('https://vrchat.com/home/login')
}

function setIcon(gray = false) {
    if (gray) {
        chrome.action.setIcon({
            path: 'images/icon32-gray.png'
        })
    } else {
        chrome.action.setIcon({
            path: 'images/icon32.png'
        })
    }
}