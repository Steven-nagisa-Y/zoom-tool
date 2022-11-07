chrome.runtime.sendMessage({ action: "loaded" });
chrome.storage.sync.get(["zoom-tool-set", "mode"], (res) => {
  let num = Number.parseInt(res["zoom-tool-set"]);
  const zoom = num >= 10 && num <= 300 ? num : 100;
  const mode = res["mode"] || Object.keys(modeMap)[0];
  if (mode === "css") {
    cssZoom(zoom);
  }
});

chrome.runtime.onMessage.addListener((e) => {
  console.log(e);
  if (e.action === "zoom") {
    cssZoom(e.zoom);
  }
});

function cssZoom(zoom: number) {
  zoom = zoom / 100;
  if (document.body) {
    var supportsZoom = "zoom" in document.body.style;
    if (supportsZoom) {
      document.body.style["zoom"] = zoom;
    } else {
      document.body.style.transformOrigin = "left top";
      document.body.style.transform = "scale(" + zoom + ")";
    }
  } else {
    var bodyInterval = window.setInterval(function () {
      if (document.body) {
        var supportsZoom = "zoom" in document.body.style;
        if (supportsZoom) {
          document.body.style["zoom"] = zoom;
        } else {
          document.body.style.transformOrigin = "left top";
          document.body.style.transform = "scale(" + zoom + ")";
        }
        window.clearInterval(bodyInterval);
      }
    }, 50);
  }
}
