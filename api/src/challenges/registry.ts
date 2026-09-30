/**
 * Maps internal challenge slugs (test file names) to anonymous template ids (q1, q2, …).
 * Adjust order here when adding challenges; API URLs still use the internal slug.
 */

export function normalizeChallengeId(challengeId: string): string {
  return challengeId.replace(/-/g, "_");
}

const TEMPLATE_BASENAME_BY_CHALLENGE: Record<string, string> = {
  binary_tree_inorder_traversal: "q1",
  grade_calculator_with_curve: "q2",
  merge_two_sorted_lists: "q3",
};

export function getTemplateBasename(challengeId: string): string | undefined {
  return TEMPLATE_BASENAME_BY_CHALLENGE[normalizeChallengeId(challengeId)];
}

export function getTemplateDownloadFileName(challengeId: string): string {
  const basename = getTemplateBasename(challengeId);
  if (!basename) {
    throw new Error(`Template not found for challenge: "${challengeId}"`);
  }
  return `${basename}.py`;
}
