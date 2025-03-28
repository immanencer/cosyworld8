import { loadSquad } from './tabs/squad.js';
import { loadActionLog } from './tabs/actions.js';
import { loadLeaderboard } from './tabs/leaderboard.js';
import { loadTribes } from './tabs/tribes.js';
import { loadSocialContent } from './tabs/social.js';

export function initializeContentLoader() {
  window.loadContent = async function () {
    const content = document.getElementById("content");
    content.innerHTML = '<div class="text-center py-12">Loading...</div>';
    const state = window.state || {};
    try {
      switch (state.activeTab) {
        case "squad":
          await loadSquad();
          break;
        case "actions":
          await loadActionLog();
          break;
        case "leaderboard":
          await loadLeaderboard();
          break;
        case "tribes":
          await loadTribes();
          break;
        case "social":
          await loadSocialContent();
          break;
        default:
          content.innerHTML = `<div class="text-center py-12 text-red-500">Unknown tab: ${state.activeTab}</div>`;
      }
    } catch (err) {
      console.error("Content load error:", err);
      content.innerHTML = `<div class="text-center py-12 text-red-500">${err.message}</div>`;
    }
  };
}
