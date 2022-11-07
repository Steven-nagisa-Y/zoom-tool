chrome.runtime.onInstalled.addListener(async () => {
  console.log(
    "%cExtension installed!",
    "font-size:24px;color:white;background-color:blue;padding:4px;"
  );
});

let mode1 = "browser";
const modeMap1 = {
  browser: "css",
  css: "browser",
};

chrome.tabs.onZoomChange.addListener((e) => {
  if (mode1 !== "browser") return;
  const zoom = Math.round(e.newZoomFactor * 100);
  console.log("Manual zoom:", zoom);
  const tabId = e.tabId;
  chrome.action.setBadgeBackgroundColor({ color: "#fff" });
  chrome.action.setBadgeText({
    text: `${zoom}`,
    tabId,
  });
});

function browserZoom1(tabId: number, zoom: number) {
  chrome.tabs.setZoom(tabId, zoom / 100);
  chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" });
}

chrome.runtime.onMessage.addListener((e) => {
  console.log("onMessage", e);
  if (e.action !== "loaded") return;
  chrome.storage.sync.get(["zoom-tool-set", "mode"], (data) => {
    let num = Number.parseInt(data["zoom-tool-set"]);
    const zoom = num >= 10 && num <= 300 ? num : 100;
    console.log("Current zoom:", zoom);
    mode1 = data["mode"] || Object.keys(modeMap1)[0];
    chrome.tabs.query({ active: true }, function (tabs) {
      const tabId = tabs[0].id;
      if (/^(f|ht)tps?:\/\//i.test(tabs[0].url)) {
        chrome.tabs.getZoom(tabId, (e) => {
          if (Math.round(e * 100) !== zoom) {
            if (mode1 === "browser") {
              chrome.tabs.sendMessage(tabId, { action: "zoom", zoom: 100 });
              browserZoom1(tabId, zoom);
            } else if (mode1 === "css") {
              browserZoom1(tabId, 100);
              chrome.tabs.sendMessage(tabId, { action: "zoom", zoom });
            }
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
