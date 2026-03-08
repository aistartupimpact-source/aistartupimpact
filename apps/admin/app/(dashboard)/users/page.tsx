'use client';

import { useState } from 'react';
import { UserPlus, Shield, MoreHorizontal, Mail, X, Save, Trash2, Edit3 } from 'lucide-react';

interface User { id: string; name: string; email: string; role: string; status: string; articles: number; lastActive: string; }

const initialUsers: User[] = [
  { id: '1', name: 'Priya Sharma', email: 'priya@aistartupimpact.com', role: 'EDITOR_IN_CHIEF', status: 'ACTIVE', articles: 42, lastActive: '5 min ago' },
  { id: '2', name: 'Rahul Kumar', email: 'rahul@aistartupimpact.com', role: 'SENIOR_WRITER', status: 'ACTIVE', articles: 28, lastActive: '1 hour ago' },
  { id: '3', name: 'Anjali Nair', email: 'anjali@aistartupimpact.com', role: 'WRITER', status: 'ACTIVE', articles: 15, lastActive: '30 min ago' },
  { id: '4', name: 'Vikram Patel', email: 'vikram@aistartupimpact.com', role: 'CONTRIBUTOR', status: 'ACTIVE', articles: 8, lastActive: '2 hours ago' },
  { id: '5', name: 'Admin User', email: 'admin@aistartupimpact.com', role: 'SUPER_ADMIN', status: 'ACTIVE', articles: 0, lastActive: 'Just now' },
];

const roles = ['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER', 'CONTRIBUTOR'];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  EDITOR_IN_CHIEF: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  SENIOR_WRITER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  WRITER: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  CONTRIBUTOR: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

const emptyUser: User = { id: '', name: '', email: '', role: 'WRITER', status: 'ACTIVE', articles: 0, lastActive: 'Just now' };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => { setEditing({ ...emptyUser, id: Date.now().toString() }); setModalOpen(true); };
  const openEdit = (u: User) => { setEditing({ ...u }); setModalOpen(true); };

  const handleSave = () => {
    if (!editing) return;
    const exists = users.find(u => u.id === editing.id);
    if (exists) setUsers(users.map(u => u.id === editing.id ? editing : u));
    else setUsers([...users, editing]);
    setModalOpen(false); setEditing(null);
  };

  const handleDelete = (id: string) => { setUsers(users.filter(u => u.id !== id)); setDeleteConfirm(null); };
  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Team</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Manage editorial team members and roles</p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2"><UserPlus className="w-4 h-4" /> Invite Member</button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Role</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Articles</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Status</th>
              <th className="px-6 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand text-sm font-bold">{u.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-sora font-semibold text-sm text-navy dark:text-white">{u.name}</h4>
                      <p className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${roleColors[u.role]}`}>
                    <Shield className="w-3 h-3" />{u.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{u.articles}</span></td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <button onClick={() => toggleStatus(u.id)} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer ${u.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{u.status}</button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                    <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{users.find(u => u.id === editing.id) ? 'Edit Member' : 'Invite New Member'}</h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Full Name *</label>
                <input type="text" className="input-field text-sm" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Priya Sharma" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Email *</label>
                <input type="email" className="input-field text-sm" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="name@aistartupimpact.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Role</label>
                <select className="input-field text-sm" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                  {roles.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={!editing.name || !editing.email} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" /> {users.find(u => u.id === editing.id) ? 'Save' : 'Send Invite'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Remove Member?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This will revoke their access.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
