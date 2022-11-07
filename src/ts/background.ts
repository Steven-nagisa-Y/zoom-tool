chrome.runtime.onInstalled.addListener(async () => {
  console.log(
    "%cExtension installed!",
    "font-size:24px;color:white;background-color:blue;padding:4px;"
  );
});

chrome.tabs.onZoomChange.addListener((e) => {
  const zoom = Math.round(e.newZoomFactor * 100);
  console.log("Manual zoom:", zoom);
  const tabId = e.tabId;
  chrome.action.setBadgeBackgroundColor({ color: "#fff" });
  chrome.action.setBadgeText({
    text: `${zoom}`,
    tabId,
  });
});

chrome.runtime.onMessage.addListener((e) => {
  console.log("onMessage", e);
  chrome.storage.sync.get(["zoom-tool-set"], (data) => {
    let num = Number.parseInt(data["zoom-tool-set"]);
    const zoom = num >= 10 && num <= 300 ? num : 100;
    console.log("Current zoom:", zoom);
    chrome.tabs.query({ active: true }, function (tabs) {
      const tabId = tabs[0].id;
      if (/^(f|ht)tps?:\/\//i.test(tabs[0].url)) {
        chrome.tabs.getZoom(tabId, (e) => {
          if (Math.round(e * 100) !== zoom) {
            chrome.tabs.setZoom(tabId, zoom / 100);
            chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" });
          }
        });
        chrome.action.setBadgeBackgroundColor({ color: "#fff" });
        chrome.action.setBadgeText({
          text: `${zoom}`,
          tabId,
        });
      }
    });
  });
});
