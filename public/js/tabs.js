export function initializeTabs() {
  const tabButtons = document.querySelectorAll("[data-tab]");
  tabButtons.forEach((btn) =>
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab))
  );

  function setActiveTab(tabName) {
    const state = window.state || {};
    state.activeTab = tabName;
    tabButtons.forEach((btn) =>
      btn.classList.toggle("bg-blue-600", btn.dataset.tab === tabName)
    );
    if (window.loadContent) window.loadContent();
  }
}
