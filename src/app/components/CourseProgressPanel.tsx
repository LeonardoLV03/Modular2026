import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import * as AdminUsersAPI from '../services/adminUsersApi';
import { UnauthorizedError } from '../services/statsApi';

interface CourseProgressContentProps {
  onUnauthorized: () => void;
}

// Contenido de la pestaña "Progreso" del AdminPanel (sin header propio)
export function CourseProgressContent({ onUnauthorized }: CourseProgressContentProps) {
  const [users, setUsers]     = useState<AdminUsersAPI.AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

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

  if (loading) return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-gray-400">Cargando progreso...</p>
    </div>
  );

  if (error || !users) return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-gray-400">Error al cargar el progreso. Verifica la conexión.</p>
    </div>
  );

  // Ordenar por XP descendente para ver a los más avanzados primero
  const sorted = [...users].sort((a, b) => b.xp - a.xp);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
            Usuarios ({sorted.length})
          </h3>

          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No hay usuarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 pr-4">Usuario</th>
                    <th className="pb-2 pr-4">Nivel</th>
                    <th className="pb-2 pr-4">XP</th>
                    <th className="pb-2 pr-4">Racha actual</th>
                    <th className="pb-2 pr-4">Mejor racha</th>
                    <th className="pb-2">Lecciones completadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      className="text-gray-700"
                    >
                      <td className="py-2 pr-4">
                        <p className="font-medium text-gray-800">{u.username}</p>
                        <p className="text-xs text-gray-400 break-all">{u.email}</p>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                          Nv. {u.level}
                        </span>
                      </td>
                      <td className="py-2 pr-4 font-semibold">{u.xp}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 ${
                          u.streak.current > 0 ? 'text-orange-500 font-semibold' : 'text-gray-400'
                        }`}>
                          <Flame size={14} /> {u.streak.current}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{u.streak.longest}</td>
                      <td className="py-2">{u.completedLessonsCount}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
