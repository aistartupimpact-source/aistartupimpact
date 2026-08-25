import { describe, it, expect } from 'vitest';
import {
  canManageTeam,
  canEditStartup,
  canChangeRole,
  canRemoveMember,
  canCreateContent,
  canEditAnyContent,
  canEditOwnContent,
  canDeleteContent,
  canViewAllDrafts,
  canViewAnalytics,
  type FounderTeamRole,
} from '@/lib/founder-team-permissions';

const ALL_ROLES: FounderTeamRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];

describe('founder-team-permissions', () => {
  describe('canManageTeam', () => {
    it('allows OWNER', () => expect(canManageTeam('OWNER')).toBe(true));
    it('allows ADMIN', () => expect(canManageTeam('ADMIN')).toBe(true));
    it('denies EDITOR', () => expect(canManageTeam('EDITOR')).toBe(false));
    it('denies VIEWER', () => expect(canManageTeam('VIEWER')).toBe(false));
  });

  describe('canEditStartup', () => {
    it('allows OWNER', () => expect(canEditStartup('OWNER')).toBe(true));
    it('allows ADMIN', () => expect(canEditStartup('ADMIN')).toBe(true));
    it('allows EDITOR', () => expect(canEditStartup('EDITOR')).toBe(true));
    it('denies VIEWER', () => expect(canEditStartup('VIEWER')).toBe(false));
  });

  describe('canChangeRole', () => {
    it('OWNER can change EDITOR to ADMIN', () => {
      expect(canChangeRole('OWNER', 'EDITOR', 'ADMIN')).toBe(true);
    });

    it('OWNER can change ADMIN to EDITOR', () => {
      expect(canChangeRole('OWNER', 'ADMIN', 'EDITOR')).toBe(true);
    });

    it('OWNER cannot promote to OWNER', () => {
      expect(canChangeRole('OWNER', 'ADMIN', 'OWNER')).toBe(false);
    });

    it('OWNER cannot change another OWNER', () => {
      expect(canChangeRole('OWNER', 'OWNER', 'ADMIN')).toBe(false);
    });

    it('ADMIN can change EDITOR to VIEWER', () => {
      expect(canChangeRole('ADMIN', 'EDITOR', 'VIEWER')).toBe(true);
    });

    it('ADMIN can change VIEWER to EDITOR', () => {
      expect(canChangeRole('ADMIN', 'VIEWER', 'EDITOR')).toBe(true);
    });

    it('ADMIN cannot change ADMIN to EDITOR', () => {
      expect(canChangeRole('ADMIN', 'ADMIN', 'EDITOR')).toBe(false);
    });

    it('ADMIN cannot promote to ADMIN', () => {
      expect(canChangeRole('ADMIN', 'EDITOR', 'ADMIN')).toBe(false);
    });

    it('EDITOR cannot change any role', () => {
      expect(canChangeRole('EDITOR', 'VIEWER', 'EDITOR')).toBe(false);
    });

    it('VIEWER cannot change any role', () => {
      expect(canChangeRole('VIEWER', 'EDITOR', 'VIEWER')).toBe(false);
    });
  });

  describe('canRemoveMember', () => {
    it('nobody can remove OWNER', () => {
      ALL_ROLES.forEach(role => {
        expect(canRemoveMember(role, 'OWNER')).toBe(false);
      });
    });

    it('OWNER can remove ADMIN', () => expect(canRemoveMember('OWNER', 'ADMIN')).toBe(true));
    it('OWNER can remove EDITOR', () => expect(canRemoveMember('OWNER', 'EDITOR')).toBe(true));
    it('OWNER can remove VIEWER', () => expect(canRemoveMember('OWNER', 'VIEWER')).toBe(true));

    it('ADMIN can remove EDITOR', () => expect(canRemoveMember('ADMIN', 'EDITOR')).toBe(true));
    it('ADMIN can remove VIEWER', () => expect(canRemoveMember('ADMIN', 'VIEWER')).toBe(true));
    it('ADMIN cannot remove ADMIN', () => expect(canRemoveMember('ADMIN', 'ADMIN')).toBe(false));

    it('EDITOR cannot remove anyone', () => {
      expect(canRemoveMember('EDITOR', 'VIEWER')).toBe(false);
    });

    it('VIEWER cannot remove anyone', () => {
      expect(canRemoveMember('VIEWER', 'EDITOR')).toBe(false);
    });
  });

  describe('content permissions', () => {
    describe('canCreateContent', () => {
      it('allows OWNER', () => expect(canCreateContent('OWNER')).toBe(true));
      it('allows ADMIN', () => expect(canCreateContent('ADMIN')).toBe(true));
      it('allows EDITOR', () => expect(canCreateContent('EDITOR')).toBe(true));
      it('denies VIEWER', () => expect(canCreateContent('VIEWER')).toBe(false));
    });

    describe('canEditAnyContent', () => {
      it('allows OWNER', () => expect(canEditAnyContent('OWNER')).toBe(true));
      it('allows ADMIN', () => expect(canEditAnyContent('ADMIN')).toBe(true));
      it('denies EDITOR', () => expect(canEditAnyContent('EDITOR')).toBe(false));
      it('denies VIEWER', () => expect(canEditAnyContent('VIEWER')).toBe(false));
    });

    describe('canEditOwnContent', () => {
      it('allows OWNER', () => expect(canEditOwnContent('OWNER')).toBe(true));
      it('allows ADMIN', () => expect(canEditOwnContent('ADMIN')).toBe(true));
      it('allows EDITOR', () => expect(canEditOwnContent('EDITOR')).toBe(true));
      it('denies VIEWER', () => expect(canEditOwnContent('VIEWER')).toBe(false));
    });

    describe('canDeleteContent', () => {
      it('allows OWNER', () => expect(canDeleteContent('OWNER')).toBe(true));
      it('allows ADMIN', () => expect(canDeleteContent('ADMIN')).toBe(true));
      it('denies EDITOR', () => expect(canDeleteContent('EDITOR')).toBe(false));
      it('denies VIEWER', () => expect(canDeleteContent('VIEWER')).toBe(false));
    });

    describe('canViewAllDrafts', () => {
      it('allows OWNER', () => expect(canViewAllDrafts('OWNER')).toBe(true));
      it('allows ADMIN', () => expect(canViewAllDrafts('ADMIN')).toBe(true));
      it('denies EDITOR', () => expect(canViewAllDrafts('EDITOR')).toBe(false));
      it('denies VIEWER', () => expect(canViewAllDrafts('VIEWER')).toBe(false));
    });

    describe('canViewAnalytics', () => {
      it('allows all roles', () => {
        ALL_ROLES.forEach(role => {
          expect(canViewAnalytics(role)).toBe(true);
        });
      });
    });
  });
});
