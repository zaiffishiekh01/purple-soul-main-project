/**
 * Badge utilities for curated product display
 * Philosophy: Whisper, not shout
 */

/**
 * Get tradition scope badge
 * Returns a single label indicating the faith scope
 */
export function getTraditionScope(traditions: string[] | null): string | null {
  if (!traditions || traditions.length === 0) return null;

  // If it includes multiple traditions, it's Abrahamic Shared
  if (traditions.length > 1) return 'Abrahamic Shared';

  // Single tradition - only show if explicitly needed (rarely)
  return null; // We don't show single-tradition badges to avoid friction
}

/**
 * Get purpose text for badge
 * Converts purposes array into "For X · Y" format
 */
export function getPurposeText(purposes: string[] | null): string | null {
  if (!purposes || purposes.length === 0) return null;

  // Take first 2 purposes only
  const selected = purposes.slice(0, 2);
  return `For ${selected.join(' · ')}`;
}

/**
 * Get the most prominent craft or experience badge
 * Shows max 1 to avoid clutter
 */
export function getQualityBadge(
  craftBadges: string[] | null,
  experienceBadges: string[] | null
): string | null {
  // Prefer craft badges first
  if (craftBadges && craftBadges.length > 0) {
    return craftBadges[0]; // Just the first one
  }

  // Then experience badges
  if (experienceBadges && experienceBadges.length > 0) {
    return experienceBadges[0];
  }

  return null;
}

/**
 * Get practical badge icon and label
 * Returns icon emoji and optional label
 */
export function getPracticalBadge(practicalBadges: string[] | null): {
  icon: string;
  label: string;
} | null {
  if (!practicalBadges || practicalBadges.length === 0) return null;

  const badge = practicalBadges[0]; // Only show first one

  const iconMap: Record<string, string> = {
    'Gift Ready': '🎁',
    'Ships Flat': '📦',
    'Easy Returns': '↩️',
  };

  return {
    icon: iconMap[badge] || '✓',
    label: badge,
  };
}
