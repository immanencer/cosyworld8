
import React from 'react';

export const ProgressRing = ({ value, maxValue, size = 120, strokeWidth = 8, color = '#60A5FA', centerContent }) => {
  // ... existing ProgressRing code ...
};

export const TierBadge = React.memo(({ tier }) => {
  // ... existing TierBadge code ...
});

export const ActivityFeed = ({ messages, memories, narratives, dungeonActions }) => {
  // ... existing ActivityFeed code ...
};

export const AncestryChain = React.memo(({ ancestry }) => {
  // ... existing AncestryChain code ...
});

export const StatsDisplay = React.memo(({ stats, size = 'small' }) => {
  // ... existing StatsDisplay code ...
});

export const XAuthButton = ({ avatarId, walletAddress, onAuthChange }) => {
  // ... existing XAuthButton code ...
};

export const WalletButton = React.memo(({ onWalletChange }) => {
  // ... existing WalletButton code ...
});

export const BurnTokenButton = React.memo(({ wallet, onSuccess }) => {
  // ... existing BurnTokenButton code ...
});

export const ViewToggle = React.memo(({ currentView, onViewChange }) => {
  // ... existing ViewToggle code ...
});
