import React, { useState } from 'react';
import { X, UserPlus, Users, Check, ShieldCheck, UserCheck } from 'lucide-react';
import { Member, MemberRole } from '../types';
import { RoleBadge } from './RoleBadge';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddMember: (name: string, role: MemberRole) => void;
  onUpdateRole?: (memberId: string, role: MemberRole) => void;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  onUpdateRole,
}) => {
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<MemberRole>('عضو');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('يرجى كتابة الاسم');
      return;
    }

    onAddMember(newName.trim(), newRole);
    setSuccessMsg(`تمت إضافة [${newName.trim()}] بدور (${newRole}) بنجاح`);
    setNewName('');
    setNewRole('عضو');
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleToggleRole = (member: Member) => {
    if (!onUpdateRole) return;
    const nextRole: MemberRole = member.role === 'مشرف' ? 'عضو' : 'مشرف';
    onUpdateRole(member.id, nextRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="members-modal-card"
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                إدارة أفراد المجلس والأدوار
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                تحديد أدوار أفراد المجلس وتوثيق المشرفين والأعضاء
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Add Member Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>إضافة شخص جديد للمجلس</span>
            </h4>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
            )}

            {successMsg && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {successMsg}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="اسم الشخص..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as MemberRole)}
                  className="w-full h-10 px-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="عضو">عضو (Member)</option>
                  <option value="مشرف">مشرف (Supervisor)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة للمجلس</span>
            </button>
          </form>

          {/* Current Members List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-zinc-600 dark:text-zinc-400">
                قائمة المسجلين ({members.length})
              </h4>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {members.filter(m => m.role === 'مشرف').length} مشرف • {members.filter(m => m.role === 'عضو').length} عضو
              </span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        انضمام: {member.joinedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <RoleBadge role={member.role} />
                    {onUpdateRole && (
                      <button
                        type="button"
                        onClick={() => handleToggleRole(member)}
                        title="تغيير الدور (مشرف / عضو)"
                        className="text-[11px] px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition"
                      >
                        تبديل
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
