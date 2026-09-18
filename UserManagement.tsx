import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '../lib/firebase';
import { Users, UserPlus, Trash2, Shield, User as UserIcon, Loader2 } from 'lucide-react';

interface AppUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: any;
}

export function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData: AppUser[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as AppUser);
      });
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setError('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    
    try {
      setCreating(true);
      setError('');
      
      let finalEmail = newEmail.trim();
      if (!finalEmail.includes('@')) {
        finalEmail = `${finalEmail}@b2bgrupodass.com.ar`;
      }

      // Creamos el usuario en la instancia secundaria para no desloguear al admin actual
      const cred = await createUserWithEmailAndPassword(secondaryAuth, finalEmail, newPassword);
      
      const newUserId = cred.user.uid;
      const newUser = { uid: newUserId, email: finalEmail };

      // Guardamos su rol en Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newUser.email,
        role: newRole,
        createdAt: serverTimestamp()
      });

      // Recargamos la lista y limpiamos
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      await loadUsers();
      
      alert('Usuario creado exitosamente.');
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('La cuota diaria gratuita de escritura de Firebase fue alcanzada para hoy. El rol se podrá guardar en Firestore cuando se restablezca la cuota diaria a medianoche.');
      } else {
        setError(err.message || 'Error al crear el usuario.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUserRole = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar los permisos de este usuario? (Esto no borra su cuenta de Firebase Authentication, solo su acceso a la app)')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('La cuota diaria gratuita de Firebase fue alcanzada para hoy. Se restablecerá automáticamente a medianoche.');
      } else {
        setError('Error al eliminar usuario.');
      }
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Gestión de Usuarios
          </h2>
          <p className="text-slate-500 mt-1">
            Crea cuentas de acceso y asigna permisos de administrador o vendedor.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              Nuevo Usuario
            </h3>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Usuario (o Email)</label>
                <input
                  type="text"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="usuario_o_email"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Rol</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="user">Vendedor (Usuario)</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="md:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {u.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}
                          `}>
                            {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                            {u.role === 'admin' ? 'Administrador' : 'Vendedor'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteUserRole(u.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Quitar acceso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
