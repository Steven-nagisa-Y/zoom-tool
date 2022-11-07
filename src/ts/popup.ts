let zoom = 100;
const zoomShow = document.getElementById("zoom");
const elZoom = document.getElementById("el-zoom") as HTMLInputElement;
const plusZoom = document.getElementById("plus-zoom");
const minusZoom = document.getElementById("minus-zoom");
const resetZoom = document.getElementById("reset-zoom");
const applyAll = document.getElementById("apply-all");

function load() {
  chrome.storage.sync.get(["zoom-tool-set"], (res) => {
    let num = Number.parseInt(res["zoom-tool-set"]);
    zoom = num >= 10 && num <= 300 ? num : 100;
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
      chrome.tabs.setZoom(tabId, zoom / 100);
      chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" });
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

applyAll.addEventListener("click", (e) => {
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    for (const t of tabs) {
      if (/^(f|ht)tps?:\/\//i.test(t.url)) {
        chrome.tabs.setZoom(t.id, zoom / 100);
        chrome.tabs.setZoomSettings(t.id, { scope: "per-tab" });
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
