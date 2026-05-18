/**
 * Writer Score Algorithm
 * ──────────────────────────────────────────────────────
 * Final score is out of 100, composed of two domains:
 *
 *  A) REVIEW SCORE  (60 pts max)
 *     Derived from student rubric reviews averaged across all projects.
 *     Sub-dimensions and weights:
 *       - Quality of writing        20%
 *       - Following requirements    15%
 *       - Communication clarity     15%
 *       - Timeliness (self-report)  10%
 *
 *  B) SLA SCORE  (40 pts max)
 *     Derived from system-tracked SLA events.
 *       - First reply within 60 min   15%
 *       - Work started within 2 hrs   10%
 *       - On-time delivery            10%
 *       - Revision turnaround ≤4 hrs   5%
 *
 * Total = A + B (0–100), displayed as integer.
 * ──────────────────────────────────────────────────────
 */

const WEIGHTS = {
  // Review sub-scores (each 1-5 → scaled to 0-1)
  quality:       0.20,   // → ×20 pts
  requirement:   0.15,   // → ×15 pts
  communication: 0.15,   // → ×15 pts
  overall:       0.10,   // → ×10 pts  (timeliness perceived by student)

  // SLA metrics (binary or ratio → scaled)
  sla_first_reply:   0.15,   // → ×15 pts
  sla_start:         0.10,   // → ×10 pts
  sla_on_time:       0.10,   // → ×10 pts
  sla_revision:      0.05,   // → ×5 pts
};

/**
 * @param {Array} reviews     - Array of Review objects from DB
 * @param {Array} slaEvents   - Array of SLAEvent objects from DB
 * @returns {{ total: number, breakdown: object }}
 */
export function computeWriterScore(reviews = [], slaEvents = []) {
  // ── REVIEW SCORE ─────────────────────────────────────
  const reviewCount = reviews.length;

  const avg = (field) => {
    if (!reviewCount) return 0;
    return reviews.reduce((s, r) => s + (r[field] || 0), 0) / reviewCount;
  };

  // Scale 1-5 → 0-1
  const scale5 = (v) => Math.max(0, Math.min(1, (v - 1) / 4));

  const qualityPts       = scale5(avg('qualityScore'))       * 20;
  const requirementPts   = scale5(avg('requirementScore'))   * 15;
  const communicationPts = scale5(avg('communicationScore')) * 15;
  const overallPts       = scale5(avg('overallScore'))       * 10;

  const reviewTotal = qualityPts + requirementPts + communicationPts + overallPts;

  // ── SLA SCORE ─────────────────────────────────────────
  const slaByType = (type) => slaEvents.filter(e => e.eventType === type);

  // First reply SLA: ≤60 min = full 15pts, scales linearly to 0 at 360 min
  const replyEvents = slaByType('FIRST_REPLY').filter(e => e.responseMinutes != null);
  const avgReply = replyEvents.length
    ? replyEvents.reduce((s, e) => s + e.responseMinutes, 0) / replyEvents.length
    : null;
  const replyPts = avgReply == null ? 7.5  // No data → partial credit
    : Math.max(0, 1 - Math.max(0, (avgReply - 60) / 300)) * 15;

  // Start SLA: ≤120 min = full 10pts, scales to 0 at 720 min
  const startEvents = slaByType('ASSIGN_ACCEPT').filter(e => e.startMinutes != null);
  const avgStart = startEvents.length
    ? startEvents.reduce((s, e) => s + e.startMinutes, 0) / startEvents.length
    : null;
  const startPts = avgStart == null ? 5
    : Math.max(0, 1 - Math.max(0, (avgStart - 120) / 600)) * 10;

  // On-time delivery: ratio of on-time deliveries × 10
  const deliveryEvents = slaByType('DELIVERY').filter(e => e.deliveryOnTime != null);
  const onTimeRatio = deliveryEvents.length
    ? deliveryEvents.filter(e => e.deliveryOnTime).length / deliveryEvents.length
    : 0.5; // No data → 50%
  const deliveryPts = onTimeRatio * 10;

  // Revision turnaround: ≤240 min = full 5pts
  const revEvents = slaByType('REVISION_TURNAROUND').filter(e => e.revisionMinutes != null);
  const avgRev = revEvents.length
    ? revEvents.reduce((s, e) => s + e.revisionMinutes, 0) / revEvents.length
    : null;
  const revPts = avgRev == null ? 2.5
    : Math.max(0, 1 - Math.max(0, (avgRev - 240) / 720)) * 5;

  const slaTotal = replyPts + startPts + deliveryPts + revPts;

  const total = Math.round(reviewTotal + slaTotal);

  return {
    total: Math.min(100, Math.max(0, total)),
    breakdown: {
      review: {
        total: Math.round(reviewTotal * 10) / 10,
        quality: Math.round(qualityPts * 10) / 10,
        requirement: Math.round(requirementPts * 10) / 10,
        communication: Math.round(communicationPts * 10) / 10,
        overall: Math.round(overallPts * 10) / 10,
        avgRatings: {
          quality: Math.round(avg('qualityScore') * 10) / 10,
          requirement: Math.round(avg('requirementScore') * 10) / 10,
          communication: Math.round(avg('communicationScore') * 10) / 10,
          overall: Math.round(avg('overallScore') * 10) / 10,
        },
        count: reviewCount,
      },
      sla: {
        total: Math.round(slaTotal * 10) / 10,
        replyPts: Math.round(replyPts * 10) / 10,
        startPts: Math.round(startPts * 10) / 10,
        deliveryPts: Math.round(deliveryPts * 10) / 10,
        revPts: Math.round(revPts * 10) / 10,
        avgReplyMinutes: avgReply ? Math.round(avgReply) : null,
        avgStartMinutes: avgStart ? Math.round(avgStart) : null,
        onTimeDeliveryPct: Math.round(onTimeRatio * 100),
        avgRevisionMinutes: avgRev ? Math.round(avgRev) : null,
      },
    },
  };
}

export function scoreLabel(score) {
  if (score >= 90) return { label: 'Elite', color: '#059669' };
  if (score >= 75) return { label: 'Expert', color: '#0284C7' };
  if (score >= 60) return { label: 'Proficient', color: '#7C3AED' };
  if (score >= 45) return { label: 'Developing', color: '#D97706' };
  return { label: 'New', color: '#6B7280' };
}
