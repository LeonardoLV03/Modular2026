import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle } from 'lucide-react';
import * as AdminUsersAPI from '../services/adminUsersApi';
import { UnauthorizedError } from '../services/statsApi';

interface UsersContentProps {
  onUnauthorized: () => void;
}

// Contenido de la pestaña "Usuarios" del AdminPanel (sin header propio)
export function UsersContent({ onUnauthorized }: UsersContentProps) {
  const [users, setUsers]             = useState<AdminUsersAPI.AdminUser[] | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [toDelete, setToDelete]       = useState<AdminUsersAPI.AdminUser | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    AdminUsersAPI.getUsers()
      .then(setUsers)
      .catch(err => {
        if (err instanceof UnauthorizedError) {
          onUnauthorized();
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const closeModal = () => {
    if (deleting) return;
    setToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await AdminUsersAPI.deleteUser(toDelete.id);
      const deletedId = toDelete.id;
      setUsers(prev => prev ? prev.filter(u => u.id !== deletedId) : prev);
      setToDelete(null);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        onUnauthorized();
        return;
      }
      setDeleteError('No se pudo eliminar el usuario. Intenta de nuevo.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-gray-400">Cargando usuarios...</p>
    </div>
  );

  if (error || !users) return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-gray-400">Error al cargar usuarios. Verifica la conexión.</p>
    </div>
  );

  // Sin `relative`: el modal cubre todo el AdminPanel (header y pestañas incluidos)
  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
            Usuarios ({users.length})
          </h3>

          {users.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No hay usuarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 pr-4">Correo</th>
                    <th className="pb-2 pr-4">Usuario</th>
                    <th className="pb-2 pr-4">Registrado el</th>
                    <th className="pb-2 pr-4">Verificado</th>
                    <th className="pb-2 pr-4">Días de inactividad</th>
                    <th className="pb-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {users.map(u => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-700"
                      >
                        <td className="py-2 pr-4 break-all">{u.email}</td>
                        <td className="py-2 pr-4">{u.username}</td>
                        <td className="py-2 pr-4 text-gray-400 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-MX') : '—'}
                        </td>
                        <td className="py-2 pr-4">{u.isVerified ? '🟢 Sí' : '🔴 No'}</td>
                        <td className="py-2 pr-4">
                          {u.neverActive ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              Sin actividad
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              (u.inactivityDays ?? 0) >= 30 ? 'bg-red-100 text-red-700'     :
                              (u.inactivityDays ?? 0) >= 7  ? 'bg-amber-100 text-amber-700' :
                                                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {u.inactivityDays ?? '—'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => setToDelete(u)}
                            title="Eliminar usuario"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <AnimatePresence>
        {toDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">¿Eliminar usuario?</h3>
                  <p className="mt-1 text-sm text-gray-600 break-all">
                    Se eliminará la cuenta <span className="font-semibold text-gray-900">{toDelete.email}</span>.
                  </p>
                  <p className="mt-2 text-sm text-red-600">
                    Esta acción es irreversible y también borrará todo su historial de lecciones.
                  </p>
                  {deleteError && (
                    <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
