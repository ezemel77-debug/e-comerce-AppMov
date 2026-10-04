// adminRoutes.js define las rutas del CRUD de administradores.
//
// Aquí se aplica el control de acceso basado en roles (RBAC):
// - verificarAdmin: permite entrar a ADMIN y OPERADOR.
// - verificarRolAdmin: además exige que el rol sea ADMIN.
//
// Las rutas GET usan solo verificarAdmin para que OPERADOR pueda ver.
// Las rutas POST, PUT y DELETE encadenan verificarAdmin + verificarRolAdmin
// para que solo ADMIN pueda crear, modificar o eliminar.

import { Router } from 'express';
const router = Router();

import { verificarAdmin, verificarRolAdmin } from '../middleware/auth.js';
import {
    listarAdministradores,
    obtenerAdministradorPorId,
    crearAdministrador,
    actualizarAdministrador,
    eliminarAdministrador,
    listarRoles,
} from '../controllers/adminController.js';

// Rutas de lectura: accesibles para ADMIN y OPERADOR.
// Operador entra gracias a verificarAdmin y puede ver la lista y el detalle.
router.get('/usuarios', verificarAdmin, listarAdministradores);
router.get('/usuarios/:id', verificarAdmin, obtenerAdministradorPorId);

// Rutas de escritura: restringidas a ADMIN.
// Se encadenan dos middlewares: primero verifica el token y el rol,
// después verifica que el rol sea exactamente ADMIN.
router.post('/usuarios', verificarAdmin, verificarRolAdmin, crearAdministrador);
router.put('/usuarios/:id', verificarAdmin, verificarRolAdmin, actualizarAdministrador);
router.delete('/usuarios/:id', verificarAdmin, verificarRolAdmin, eliminarAdministrador);

// Roles disponibles para asignar (solo ADMIN puede asignar roles).
router.get('/roles', verificarAdmin, verificarRolAdmin, listarRoles);

export default router;
