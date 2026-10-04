// authController.js maneja el inicio de sesión.
// Hay dos logins separados:
// - /auth/cliente/login para clientes del ecommerce.
// - /auth/admin/login para usuarios administradores del sistema.
// Cada uno genera un JWT distinto, por eso un token de cliente
// no sirve para acceder a rutas de admin, y viceversa.

import { compararPassword, generarToken, JWT_SECRET_CLIENT, JWT_SECRET_ADMIN } from '../utils/auth.js';
import Cliente from '../models/clientes.model.js';
import Usuario from '../models/usuarios.model.js';
import Rol from '../models/roles.model.js';

/**
 * loginCliente
 * Recibe email y password, valida contra el modelo Cliente y
 * devuelve un token JWT con tipo 'cliente'.
 */
export const loginCliente = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validamos que vengan los datos mínimos.
        if (!email || !password) {
            return res.status(400).json({
                estado: false,
                mensaje: 'Debe proporcionar email y password',
            });
        }

        // Buscamos el cliente por email.
        const cliente = await Cliente.findOne({ where: { email } });

        if (!cliente) {
            return res.status(401).json({
                estado: false,
                mensaje: 'Credenciales inválidas',
            });
        }

        // Comparamos la contraseña enviada con el hash guardado.
        const passwordValido = await compararPassword(password, cliente.password);

        if (!passwordValido) {
            return res.status(401).json({
                estado: false,
                mensaje: 'Credenciales inválidas',
            });
        }

        // Generamos el token con datos públicos del cliente.
        // Usamos el secreto de cliente para que no sirva en rutas de admin.
        const token = generarToken({
            id: cliente.id,
            email: cliente.email,
            tipo: 'cliente',
        }, JWT_SECRET_CLIENT);

        res.json({
            estado: true,
            mensaje: 'Login de cliente exitoso',
            token,
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email,
            },
        });
    } catch (error) {
        console.error('Error en loginCliente:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al iniciar sesión',
            error: error.message,
        });
    }
};

/**
 * registrarCliente
 * Recibe nombre, email y password, crea el cliente y devuelve un token JWT.
 * La contraseña se encripta automáticamente con el hook del modelo Cliente.
 */
export const registrarCliente = async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body;

        // Validamos que vengan los datos mínimos.
        if (!nombre || !email || !password) {
            return res.status(400).json({
                estado: false,
                mensaje: 'Debe proporcionar nombre, email y password',
            });
        }

        // Verificamos que el email no esté registrado.
        const existe = await Cliente.findOne({ where: { email } });

        if (existe) {
            return res.status(400).json({
                estado: false,
                mensaje: 'El email ya está registrado',
            });
        }

        // Creamos el cliente. El hook beforeCreate encripta la contraseña.
        const cliente = await Cliente.create({ nombre, apellido, email, password });

        // Generamos el token con datos públicos del cliente.
        const token = generarToken({
            id: cliente.id,
            email: cliente.email,
            tipo: 'cliente',
        }, JWT_SECRET_CLIENT);

        res.status(201).json({
            estado: true,
            mensaje: 'Registro de cliente exitoso',
            token,
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                email: cliente.email,
            },
        });
    } catch (error) {
        console.error('Error en registrarCliente:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al registrar cliente',
            error: error.message,
        });
    }
};

/**
 * refreshTokenCliente
 * Valida el token del cliente mediante el middleware verificarCliente
 * y emite un nuevo token renovado con los datos actualizados del cliente.
 */
export const refreshTokenCliente = async (req, res) => {
    try {
        const cliente = req.cliente;

        const token = generarToken({
            id: cliente.id,
            email: cliente.email,
            tipo: 'cliente',
        }, JWT_SECRET_CLIENT);

        res.json({
            estado: true,
            mensaje: 'Token validado y renovado correctamente',
            token,
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                email: cliente.email,
            },
        });
    } catch (error) {
        console.error('Error en refreshTokenCliente:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al validar o renovar token',
            error: error.message,
        });
    }
};

/**
 * obtenerPerfilCliente
 * Devuelve los datos del perfil del cliente logueado (sin contraseña).
 */
export const obtenerPerfilCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.cliente.id, {
            attributes: { exclude: ['password'] },
        });

        if (!cliente) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Cliente no encontrado',
            });
        }

        res.json({
            estado: true,
            data: cliente,
        });
    } catch (error) {
        console.error('Error al obtener perfil del cliente:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener perfil',
            error: error.message,
        });
    }
};

/**
 * actualizarPerfilCliente
 * Permite al cliente logueado actualizar sus datos personales.
 */
export const actualizarPerfilCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.cliente.id);

        if (!cliente) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Cliente no encontrado',
            });
        }

        const { nombre, apellido, email, telefono, direccion, password } = req.body;

        // Validamos que el email no pertenezca a otro cliente
        if (email && email !== cliente.email) {
            const existeEmail = await Cliente.findOne({ where: { email } });
            if (existeEmail && existeEmail.id !== cliente.id) {
                return res.status(400).json({
                    estado: false,
                    mensaje: 'El email ya se encuentra registrado por otro usuario',
                });
            }
        }

        const campos = {};
        if (nombre !== undefined) campos.nombre = nombre;
        if (apellido !== undefined) campos.apellido = apellido;
        if (email !== undefined) campos.email = email;
        if (telefono !== undefined) campos.telefono = telefono;
        if (direccion !== undefined) campos.direccion = direccion;
        if (password && password.trim() !== '') {
            campos.password = password; // Hook beforeUpdate de Cliente lo encripta
        }

        await cliente.update(campos);

        res.json({
            estado: true,
            mensaje: 'Perfil actualizado correctamente',
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                email: cliente.email,
                telefono: cliente.telefono,
                direccion: cliente.direccion,
            },
        });
    } catch (error) {
        console.error('Error al actualizar perfil del cliente:', error);
        res.status(400).json({
            estado: false,
            mensaje: 'Error al actualizar perfil',
            error: error.message,
        });
    }
};

/**
 * loginAdmin
 * Recibe email y password, valida contra el modelo Usuario y
 * verifica que el rol sea ADMIN u OPERADOR. Devuelve un token JWT
 * con tipo 'admin' y los datos del rol.
 */
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validamos que vengan los datos mínimos.
        if (!email || !password) {
            return res.status(400).json({
                estado: false,
                mensaje: 'Debe proporcionar email y password',
            });
        }

        // Buscamos el usuario incluyendo su rol.
        const usuario = await Usuario.findOne({
            where: { email },
            include: {
                model: Rol,
                as: 'rol',
            },
        });

        // Si no existe o no tiene rol, rechazamos.
        if (!usuario || !usuario.rol) {
            return res.status(401).json({
                estado: false,
                mensaje: 'Credenciales inválidas o rol no asignado',
            });
        }

        // Solo permitimos el login si el rol es ADMIN u OPERADOR.
        // Cualquier otro rol no puede ingresar al panel de administración.
        const rolNombre = usuario.rol.nombre.toUpperCase();
        if (!['ADMIN', 'OPERADOR'].includes(rolNombre)) {
            return res.status(403).json({
                estado: false,
                mensaje: 'Acceso solo para administradores u operadores',
            });
        }

        // Comparamos la contraseña enviada con el hash guardado.
        const passwordValido = await compararPassword(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({
                estado: false,
                mensaje: 'Credenciales inválidas',
            });
        }

        // Generamos el token con datos públicos del admin y su rol.
        // El campo tipo='admin' y el secreto JWT_SECRET_ADMIN garantizan que
        // este token solo sirva en rutas de administrador, no en rutas de cliente.
        const token = generarToken({
            id: usuario.id,
            email: usuario.email,
            tipo: 'admin',
            rolId: usuario.rolId,
            rolNombre: usuario.rol.nombre,
        }, JWT_SECRET_ADMIN);

        res.json({
            estado: true,
            mensaje: 'Login de administrador exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol.nombre,
                rolId: usuario.rolId,
            },
        });
    } catch (error) {
        console.error('Error en loginAdmin:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al iniciar sesión',
            error: error.message,
        });
    }
};

/**
 * refreshTokenAdmin
 * Valida el token del administrador y emite uno nuevo con datos actualizados.
 * El middleware verificarAdmin ya cargó al usuario en req.usuario,
 * por lo que podemos confiar en esa información.
 */
export const refreshTokenAdmin = async (req, res) => {
    try {
        const usuario = req.usuario;

        const token = generarToken({
            id: usuario.id,
            email: usuario.email,
            tipo: 'admin',
            rolId: usuario.rolId,
            rolNombre: usuario.rol.nombre,
        }, JWT_SECRET_ADMIN);

        res.json({
            estado: true,
            mensaje: 'Token de administrador validado y renovado',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol.nombre,
                rolId: usuario.rolId,
            },
        });
    } catch (error) {
        console.error('Error en refreshTokenAdmin:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al renovar token de administrador',
            error: error.message,
        });
    }
};

/**
 * obtenerPerfilAdmin
 * Devuelve el perfil del administrador logueado.
 * Excluye el campo password de la respuesta.
 */
export const obtenerPerfilAdmin = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, {
            include: { model: Rol, as: 'rol' },
            attributes: { exclude: ['password'] },
        });

        if (!usuario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Administrador no encontrado',
            });
        }

        res.json({
            estado: true,
            data: usuario,
        });
    } catch (error) {
        console.error('Error al obtener perfil de administrador:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener perfil de administrador',
            error: error.message,
        });
    }
};
