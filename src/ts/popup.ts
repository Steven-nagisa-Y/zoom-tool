let zoom = 100;
let mode = "browser";
const $ = function (id: string): HTMLElement {
  return document.getElementById(id);
};
const zoomShow = $("zoom");
const elZoom = $("el-zoom") as HTMLInputElement;
const plusZoom = $("plus-zoom");
const minusZoom = $("minus-zoom");
const resetZoom = $("reset-zoom");
const applyAll = $("apply-all");
const zoomMode = $("zoom-mode");

const modeMap1 = {
  browser: "css",
  css: "browser",
};

function browserZoom(tabId: number, zoom: number) {
  chrome.tabs.setZoom(tabId, zoom / 100);
  chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" });
}

function load() {
  chrome.storage.sync.get(["zoom-tool-set", "mode"], (res) => {
    let num = Number.parseInt(res["zoom-tool-set"]);
    zoom = num >= 10 && num <= 300 ? num : 100;
    mode = res["mode"] || Object.keys(modeMap1)[0];
    zoomMode.innerHTML = mode;
    setAll(zoom);
  });
}

window.addEventListener("load", () => {
  load();
});

function setAll(zoom: number) {
  zoomShow.innerHTML = `${zoom}%`;
  elZoom.value = zoom.toString();
  chrome.storage.sync.set({ "zoom-tool-set": zoom }, () => {
    console.log(`Set zoom-tool-set to ${zoom}`);
  });
  console.log(zoom / 100);
  chrome.tabs.query({ active: true }, function (tabs) {
    const tabId = tabs[0].id;
    if (/^(f|ht)tps?:\/\//i.test(tabs[0].url)) {
      if (mode === "browser") {
        browserZoom(tabId, zoom);
      } else if (mode === "css") {
        browserZoom(tabId, 100);
        chrome.tabs.sendMessage(tabId, { action: "zoom", zoom });
      }
      chrome.action.setBadgeBackgroundColor({ color: "#fff" });
      chrome.action.setBadgeText({
        text: `${zoom}`,
        tabId,
      });
    }
  });
}

elZoom.addEventListener("change", (e) => {
  zoom = Number.parseInt((e.target as HTMLInputElement).value);
  setAll(zoom);
  e.stopPropagation();
});

plusZoom.addEventListener("click", (e) => {
  zoom = zoom + 5 <= 300 ? zoom + 5 : zoom;
  setAll(zoom);
  e.stopPropagation();
});

minusZoom.addEventListener("click", (e) => {
  zoom = zoom - 5 >= 10 ? zoom - 5 : zoom;
  setAll(zoom);
  e.stopPropagation();
});

resetZoom.addEventListener("click", (e) => {
  zoom = 100;
  setAll(zoom);
  e.stopPropagation();
});

zoomMode.addEventListener("click", (e) => {
  mode = modeMap1[mode];
  zoomMode.innerHTML = mode;
  chrome.storage.sync.set({ mode });
  setAll(zoom);
  e.stopPropagation();
});

applyAll.addEventListener("click", (e) => {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    for (const t of tabs) {
      if (/^(f|ht)tps?:\/\//i.test(t.url)) {
        if (mode === "browser") {
          browserZoom(t.id, zoom);
        } else if (mode === "css") {
          browserZoom(t.id, 100);
          chrome.tabs.sendMessage(t.id, { action: "zoom", zoom });
        }
        chrome.action.setBadgeBackgroundColor({ color: "#fff" });
        chrome.action.setBadgeText({
          text: `${zoom}`,
          tabId: t.id,
        });
      }
    }
  });
  e.stopPropagation();
});
