// authRoutes.js define las rutas de autenticación.
// Aquí se hacen los logins de clientes y administradores.

import { Router } from 'express';
const router = Router();

import { verificarCliente, verificarAdmin } from '../middleware/auth.js';
import {
    registrarCliente,
    loginCliente,
    loginAdmin,
    refreshTokenCliente,
    refreshTokenAdmin,
    obtenerPerfilCliente,
    actualizarPerfilCliente,
    obtenerPerfilAdmin,
} from '../controllers/authController.js';

// POST /auth/cliente/registro -> registro para clientes del ecommerce.
router.post('/cliente/registro', registrarCliente);

// POST /auth/cliente/login -> login para clientes del ecommerce.
router.post('/cliente/login', loginCliente);

// GET /auth/cliente/refresh -> valida el token del cliente y devuelve uno nuevo renovado.
router.get('/cliente/refresh', verificarCliente, refreshTokenCliente);

// GET /auth/cliente/perfil -> obtiene los datos del perfil del cliente logueado.
router.get('/cliente/perfil', verificarCliente, obtenerPerfilCliente);

// PUT /auth/cliente/perfil -> actualiza los datos del cliente logueado.
router.put('/cliente/perfil', verificarCliente, actualizarPerfilCliente);

// Endpoints de autenticación del panel de administración.
// Todos usan el controlador de admin, y los que requieren sesión
// pasan por el middleware verificarAdmin.

// POST /auth/admin/login -> login para usuarios administradores.
router.post('/admin/login', loginAdmin);

// GET /auth/admin/refresh -> valida el token del admin y devuelve uno nuevo renovado.
router.get('/admin/refresh', verificarAdmin, refreshTokenAdmin);

// GET /auth/admin/perfil -> obtiene el perfil del administrador logueado.
router.get('/admin/perfil', verificarAdmin, obtenerPerfilAdmin);

export default router;
