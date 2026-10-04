// adminController.js contiene la lógica del panel de administración.
//
// Las funciones de lectura (listar, obtener por id) se usan tanto por ADMIN
// como por OPERADOR. Las funciones de escritura (crear, actualizar, eliminar)
// están protegidas por el middleware verificarRolAdmin en las rutas.
//
// Los métodos findAll/findByPk excluyen la contraseña para no enviarla
// al frontend.

import { Op } from 'sequelize';
import Usuario from '../models/usuarios.model.js';
import Rol from '../models/roles.model.js';

/**
 * listarAdministradores
 * Devuelve los usuarios administradores aplicando:
 * - Paginación en servidor (limit y offset con findAndCountAll).
 * - Ordenamiento dinámico por columna y dirección (ASC/DESC).
 * - Búsqueda multi-campo en un solo término (nombre, apellido, email).
 * - Filtro opcional por rolId.
 *
 * Accesible para ADMIN y OPERADOR.
 */
export const listarAdministradores = async (req, res) => {
    try {
        console.log('[BACKEND] Parámetros de consulta recibidos en /admin/usuarios:', req.query);

        // =========================================================================
        // 1. PAGINACIÓN DEL LADO DEL SERVIDOR (Server-Side Pagination)
        // =========================================================================
        // En lugar de cargar todos los registros en memoria y hacer un .slice() en
        // el frontend (lo que colapsaría el rendimiento con miles de registros),
        // calculamos LIMIT y OFFSET para que la base de datos MySQL entregue
        // únicamente el bloque de datos solicitado.
        const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
        const limite = Math.max(1, parseInt(req.query.limite, 10) || 5);
        const offset = (pagina - 1) * limite;
 
        // =========================================================================
        // 2. ORDENAMIENTO DINÁMICO (Dynamic Sorting)
        // =========================================================================
        // Lista blanca de columnas permitidas para evitar inyecciones SQL.
        const columnasPermitidas = ['id', 'nombre', 'apellido', 'email', 'rol'];
        const ordenarPor = columnasPermitidas.includes(req.query.ordenarPor) ? req.query.ordenarPor : 'id';
        const direccion = req.query.direccion?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        let order;
        if (ordenarPor === 'rol') {
            // Para ordenar por el nombre del rol en la tabla asociada:
            order = [[{ model: Rol, as: 'rol' }, 'nombre', direccion]];
        } else {
            order = [[ordenarPor, direccion]];
        }

        // =========================================================================
        // 3. FILTROS Y BÚSQUEDA MULTI-CAMPO (Multi-field Search)
        // =========================================================================
        const where = {};

        // Filtro específico por rolId si se especificó
        if (req.query.rolId && req.query.rolId.trim() !== '') {
            where.rolId = parseInt(req.query.rolId, 10);
        }

        // Búsqueda multi-campo: un solo término de búsqueda consulta simultáneamente
        // por nombre, apellido o email mediante Op.or y Op.like (%termino%)
        const busqueda = req.query.busqueda?.trim();
        if (busqueda) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${busqueda}%` } },
                { apellido: { [Op.like]: `%${busqueda}%` } },
                { email: { [Op.like]: `%${busqueda}%` } },
            ];
        }

        // =========================================================================
        // 4. CONSULTA CON findAndCountAll
        // =========================================================================
        // findAndCountAll ejecuta un COUNT(*) con los filtros y un SELECT con LIMIT/OFFSET.
        // distinct: true garantiza que el conteo no se duplique al hacer JOIN con roles.
        const { count, rows } = await Usuario.findAndCountAll({
            where,
            include: {
                model: Rol,
                as: 'rol',
            },
            attributes: { exclude: ['password'] },
            order,
            limit: limite,
            offset: offset,
            distinct: true,
        });

        const totalPaginas = Math.ceil(count / limite) || 1;

        console.log(`[BACKEND] Total registros encontrados: ${count}. Enviando página ${pagina} de ${totalPaginas}`);

        res.json({
            estado: true,
            data: {
                usuarios: rows,
                total: count,
                pagina,
                limite,
                totalPaginas,
            },
        });
    } catch (error) {
        console.error('[BACKEND] Error al listar administradores:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al listar administradores',
            error: error.message,
        });
    }
};

/**
 * obtenerAdministradorPorId
 * Devuelve un usuario administrador por su id.
 * Accesible para ADMIN y OPERADOR.
 */
export const obtenerAdministradorPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        const usuario = await Usuario.findByPk(id, {
            include: {
                model: Rol,
                as: 'rol',
            },
            attributes: { exclude: ['password'] },
        });

        if (!usuario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Usuario no encontrado',
            });
        }

        res.json({
            estado: true,
            data: usuario,
        });
    } catch (error) {
        console.error('Error al obtener administrador:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al obtener administrador',
            error: error.message,
        });
    }
};

/**
 * crearAdministrador
 * Crea un nuevo usuario con rol de administración.
 * Solo accesible para ADMIN.
 */
export const crearAdministrador = async (req, res) => {
    try {
        const { nombre, apellido, email, password, rolId } = req.body;

        if (!nombre || !email || !password || !rolId) {
            return res.status(400).json({
                estado: false,
                mensaje: 'Debe proporcionar nombre, email, password y rolId',
            });
        }

        // Verificamos que el rol exista y sea ADMIN u OPERADOR.
        // Así evitamos asignar roles ajenos al panel de administración.
        const rol = await Rol.findByPk(rolId);
        if (!rol || !['ADMIN', 'OPERADOR'].includes(rol.nombre.toUpperCase())) {
            return res.status(400).json({
                estado: false,
                mensaje: 'El rol seleccionado no es válido para un usuario administrativo',
            });
        }

        // Verificamos que el email no esté registrado.
        // El modelo también tiene unique, pero validamos antes para un mensaje claro.
        const existe = await Usuario.findOne({ where: { email } });
        if (existe) {
            return res.status(400).json({
                estado: false,
                mensaje: 'El email ya está registrado',
            });
        }

        const data = await Usuario.create({
            nombre,
            apellido,
            email,
            password,
            rolId,
        });

        res.status(201).json({
            estado: true,
            mensaje: 'Usuario administrativo creado correctamente',
            data: await Usuario.findByPk(data.id, {
                include: { model: Rol, as: 'rol' },
                attributes: { exclude: ['password'] },
            }),
        });
    } catch (error) {
        console.error('Error al crear administrador:', error);
        res.status(400).json({
            estado: false,
            mensaje: 'Error al crear administrador',
            error: error.message,
        });
    }
};

/**
 * actualizarAdministrador
 * Actualiza los datos de un usuario administrativo.
 * Solo accesible para ADMIN.
 */
export const actualizarAdministrador = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Usuario no encontrado',
            });
        }

        const { nombre, apellido, email, password, rolId } = req.body;

        if (email && email !== usuario.email) {
            const existeEmail = await Usuario.findOne({ where: { email } });
            if (existeEmail && existeEmail.id !== id) {
                return res.status(400).json({
                    estado: false,
                    mensaje: 'El email ya se encuentra registrado por otro usuario',
                });
            }
        }

        if (rolId) {
            const rol = await Rol.findByPk(rolId);
            if (!rol || !['ADMIN', 'OPERADOR'].includes(rol.nombre.toUpperCase())) {
                return res.status(400).json({
                    estado: false,
                    mensaje: 'El rol seleccionado no es válido para un usuario administrativo',
                });
            }
        }

        // Construimos un objeto solo con los campos enviados.
        // Así no sobrescribimos valores con undefined.
        const campos = {};
        if (nombre !== undefined) campos.nombre = nombre;
        if (apellido !== undefined) campos.apellido = apellido;
        if (email !== undefined) campos.email = email;
        if (rolId !== undefined) campos.rolId = rolId;
        if (password && password.trim() !== '') {
            campos.password = password; // El hook beforeUpdate de Sequelize encripta automáticamente
        }

        await usuario.update(campos);

        res.json({
            estado: true,
            mensaje: 'Usuario administrativo actualizado correctamente',
            data: await Usuario.findByPk(usuario.id, {
                include: { model: Rol, as: 'rol' },
                attributes: { exclude: ['password'] },
            }),
        });
    } catch (error) {
        console.error('Error al actualizar administrador:', error);
        res.status(400).json({
            estado: false,
            mensaje: 'Error al actualizar administrador',
            error: error.message,
        });
    }
};

/**
 * eliminarAdministrador
 * Elimina un usuario administrativo.
 * Solo accesible para ADMIN.
 * Un administrador no puede eliminarse a sí mismo.
 */
export const eliminarAdministrador = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        // Impedimos que un administrador se elimine a sí mismo,
        // evitando quedar sin acceso al panel.
        if (req.usuario.id === id) {
            return res.status(400).json({
                estado: false,
                mensaje: 'No podés eliminar tu propio usuario',
            });
        }

        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                estado: false,
                mensaje: 'Usuario no encontrado',
            });
        }

        await usuario.destroy();

        res.json({
            estado: true,
            mensaje: 'Usuario administrativo eliminado correctamente',
        });
    } catch (error) {
        console.error('Error al eliminar administrador:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al eliminar administrador',
            error: error.message,
        });
    }
};

/**
 * listarRoles
 * Devuelve los roles ADMIN y OPERADOR disponibles para asignar.
 * Solo accesible para ADMIN.
 */
export const listarRoles = async (req, res) => {
    try {
        const data = await Rol.findAll({
            where: {
                nombre: ['ADMIN', 'OPERADOR'],
            },
            order: [['nombre', 'ASC']],
        });

        res.json({
            estado: true,
            data,
        });
    } catch (error) {
        console.error('Error al listar roles:', error);
        res.status(500).json({
            estado: false,
            mensaje: 'Error al listar roles',
            error: error.message,
        });
    }
};
