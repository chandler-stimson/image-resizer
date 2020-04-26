'use strict';

chrome.browserAction.onClicked.addListener(() => chrome.storage.local.get({
  width: 700,
  height: 700,
  left: screen.availLeft + Math.round((screen.availWidth - 700) / 2),
  top: screen.availTop + Math.round((screen.availHeight - 700) / 2)
}, prefs => {
  chrome.windows.create({
    url: chrome.extension.getURL('data/window/index.html'),
    width: prefs.width,
    height: prefs.height,
    left: prefs.left,
    top: prefs.top,
    type: 'popup'
  });
}));
