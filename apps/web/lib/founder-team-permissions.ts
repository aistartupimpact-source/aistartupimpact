export type FounderTeamRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

const ROLE_RANK: Record<string, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

// Team management
export function canManageTeam(role: FounderTeamRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canEditStartup(role: FounderTeamRole): boolean {
  return role !== "VIEWER";
}

export function canChangeRole(
  actorRole: FounderTeamRole,
  targetCurrentRole: FounderTeamRole,
  newRole: FounderTeamRole
): boolean {
  if (actorRole === "OWNER") {
    return newRole !== "OWNER" && targetCurrentRole !== "OWNER";
  }
  if (actorRole === "ADMIN") {
    return (
      ROLE_RANK[targetCurrentRole] < ROLE_RANK["ADMIN"] &&
      ROLE_RANK[newRole] < ROLE_RANK["ADMIN"]
    );
  }
  return false;
}

export function canRemoveMember(
  actorRole: FounderTeamRole,
  targetRole: FounderTeamRole
): boolean {
  if (targetRole === "OWNER") return false;
  if (actorRole === "OWNER") return true;
  if (actorRole === "ADMIN") return ROLE_RANK[targetRole] < ROLE_RANK["ADMIN"];
  return false;
}

// Content permissions
export function canCreateContent(role: FounderTeamRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "EDITOR";
}

export function canEditAnyContent(role: FounderTeamRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canEditOwnContent(role: FounderTeamRole): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "EDITOR";
}

export function canDeleteContent(role: FounderTeamRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canViewAllDrafts(role: FounderTeamRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canViewAnalytics(role: FounderTeamRole): boolean {
  return true;
}
