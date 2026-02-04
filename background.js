const RULE_START = 1000;

// Watch for popup changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blockedSites) {
    applyRules(changes.blockedSites.newValue || []);
  }
});

// On install / reload
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("blockedSites", data => {
    applyRules(data.blockedSites || []);
  });
});

async function applyRules(sites) {
  // Remove existing rules
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map(r => r.id);

  if (removeIds.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeIds
    });
  }

  // Add redirect rules (ONLY supported fields)
  const rules = sites.map((site, index) => ({
    id: RULE_START + index,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/blocked.html"
      }
    },
    condition: {
      // Matches https://instagram.com, www.instagram.com, etc.
      // Will NEVER match chrome-extension:// URLs
      urlFilter: `||${site}^`,
      resourceTypes: ["main_frame"]
    }
  }));

  if (rules.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules
    });
  }
}
