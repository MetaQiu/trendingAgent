export function getRepoAnchorId(repoFullName: string) {
  return `repo-${repoFullName.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
