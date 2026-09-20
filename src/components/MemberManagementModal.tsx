import React, { useState } from 'react';
import { X, UserPlus, Users, Trash2, Check, Shield } from 'lucide-react';
import { Member } from '../types';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddMember: (name: string, role: 'عضو' | 'رفيق') => void;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
}) => {
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'عضو' | 'رفيق'>('رفيق');
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
    setSuccessMsg(`تمت إضافة [${newName.trim()}] بنجاح`);
    setNewName('');
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3000);
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
                أفراد المجلس
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                قائمة الإخوة والأصدقاء المشاركين في متابعة الأهداف المشتركة
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
              <span>إضافة رفيق جديد للمجلس</span>
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
                  placeholder="اسم الرفيق أو الأخ..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full h-10 px-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="رفيق">رفيق</option>
                  <option value="عضو">عضو</option>
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
            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              قائمة المشاركين ({members.length})
            </h4>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${member.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        تاريخ الانضمام: {member.joinedDate}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                    {member.role}
                  </span>
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
