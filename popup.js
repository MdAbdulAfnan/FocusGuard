/* ===============================
   ELEMENTS
================================ */

const checkboxes = document.querySelectorAll(".grid input");
const siteInput = document.getElementById("site");
const addBtn = document.getElementById("add");
const focusBtn = document.getElementById("focus");
const moderateBtn = document.getElementById("moderate");
const basicBtn = document.getElementById("basic");
const disableAllBtn = document.getElementById("disableAll");
const closeBtn = document.getElementById("closeBtn");

/* ===============================
   DATA
================================ */

const ALL = [
  "instagram.com",
  "youtube.com",
  "facebook.com",
  "snapchat.com",
  "x.com",
  "netflix.com",
  "reddit.com",
  "discord.com"
];

const ENTERTAINMENT = [
  "instagram.com",
  "snapchat.com",
  "netflix.com",
  "youtube.com"
];

let blockedSites = [];


let isSyncing = false;
/* ===============================
   INIT
================================ */

chrome.storage.local.get(["blockedSites"], data => {
  blockedSites = data.blockedSites || [];
  syncCheckboxes();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blockedSites) {
    isSyncing = true;
    blockedSites = changes.blockedSites.newValue || [];
    syncCheckboxes();
    isSyncing = false;
  }
});

/* ===============================
   MODE BUTTONS
================================ */

focusBtn.onclick = () => setBlocked(ALL);

moderateBtn.onclick = () => setBlocked(ENTERTAINMENT);

basicBtn.onclick = () => setBlocked([ALL[0]]);

disableAllBtn.onclick = () => {
  blockedSites = [];
  save();
};

/* ===============================
   CHECKBOX HANDLING
================================ */

checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    if (isSyncing) return;
    const site = cb.dataset.site;

    if (cb.checked && !blockedSites.includes(site)) {
      blockedSites.push(site);
    }

    if (!cb.checked) {
      blockedSites = blockedSites.filter(s => s !== site);
    }

    save();
  });
});

/* ===============================
   MANUAL ADD
================================ */

addBtn.onclick = addSite;
siteInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addSite();
});

function addSite() {
  let site = siteInput.value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];

  if (!site || blockedSites.includes(site)) return;

  blockedSites.push(site);
  siteInput.value = "";
  save();
}

/* ===============================
   HELPERS
================================ */

function setBlocked(list) {
  blockedSites = [...list];
  save();
}

function syncCheckboxes() {
  checkboxes.forEach(cb => {
    cb.checked = blockedSites.includes(cb.dataset.site);
  });
}

function save() {
  chrome.storage.local.set({ blockedSites });
}

/* ===============================
   CLOSE POPUP
================================ */

closeBtn.onclick = () => window.close();
