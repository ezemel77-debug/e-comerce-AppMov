// Header.jsx es la cabecera del sitio.
// Usa NavLink de React Router para marcar el enlace activo, incluye menú desplegable de servicios
// y AuthContext para el estado de sesión.

import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const subServicios = [
    { to: '/servicios', label: 'Todos los servicios', end: true, desc: 'Visión general de soluciones' },
    { to: '/servicios/diseno-web', label: 'Diseño Web', desc: 'UI/UX y sitios responsive' },
    { to: '/servicios/desarrollo-apps', label: 'Desarrollo de Apps', desc: 'Web apps y móviles con React' },
    { to: '/servicios/software-gestion', label: 'Software de Gestión', desc: 'Paneles y sistemas a medida' },
];

function Header() {
    const [abierto, setAbierto] = useState(false);
    const [serviciosAbierto, setServiciosAbierto] = useState(false);
    const [serviciosMovilAbierto, setServiciosMovilAbierto] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    const { usuario, isAuthenticated, logout } = useAuth();

    const estaEnServicios = location.pathname.startsWith('/servicios');

    // Cerrar el dropdown al hacer click fuera
    useEffect(() => {
        const handleClickFuera = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setServiciosAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    // Cerrar menús al cambiar de ruta
    useEffect(() => {
        setServiciosAbierto(false);
        setAbierto(false);
    }, [location.pathname]);

    const navClass = ({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
            ? 'bg-indigo-600 text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`;

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <NavLink to="/" className="text-lg font-bold tracking-tight text-slate-900">
                    INTEGRADO
                </NavLink>

                {/* Botón hamburguesa móvil */}
                <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 md:hidden"
                    onClick={() => setAbierto(!abierto)}
                >
                    {abierto ? 'Cerrar' : 'Menú'}
                </button>

                {/* Navegación Desktop */}
                <nav className="hidden items-center gap-1 md:flex">
                    <NavLink to="/" className={navClass} end>
                        Inicio
                    </NavLink>

                    <NavLink to="/empresa" className={navClass}>
                        La Empresa
                    </NavLink>

                    {/* Menú desplegable de Servicios */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setServiciosAbierto(!serviciosAbierto)}
                            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${estaEnServicios || serviciosAbierto
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                        >
                            <span>Servicios</span>
                            <svg
                                className={`h-4 w-4 transition-transform duration-200 ${serviciosAbierto ? 'rotate-180' : ''
                                    }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown flotante */}
                        {serviciosAbierto && (
                            <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-1">
                                <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Nuestras Soluciones
                                </p>
                                {subServicios.map((sub) => (
                                    <NavLink
                                        key={sub.to}
                                        to={sub.to}
                                        end={sub.end}
                                        onClick={() => setServiciosAbierto(false)}
                                        className={({ isActive }) =>
                                            `block rounded-xl px-3 py-2 transition ${isActive
                                                ? 'bg-indigo-50 text-indigo-900 font-semibold'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }`
                                        }
                                    >
                                        <div className="text-sm font-medium">{sub.label}</div>
                                        <div className="text-xs text-slate-500">{sub.desc}</div>
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>

                    <NavLink to="/contacto" className={navClass}>
                        Contacto
                    </NavLink>

                    <div className="mx-2 h-5 w-px bg-slate-200" />

                    {/* Estado de autenticación */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <NavLink to="/perfil" className={navClass}>
                                Mi Perfil
                            </NavLink>
                            <span className="text-sm font-medium text-slate-700">
                                Hola, <strong className="text-slate-900">{usuario?.nombre}</strong>
                            </span>
                            <button
                                onClick={logout}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                            >
                                Salir
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <NavLink to="/login" className={navClass}>
                                Ingresar
                            </NavLink>
                            <Link
                                to="/registro"
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}

                    <NavLink
                        to="/admin"
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                        Admin
                    </NavLink>
                </nav>
            </div>

            {/* Menú móvil desplegado */}
            {abierto && (
                <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden bg-white">
                    <NavLink to="/" className={navClass} end onClick={() => setAbierto(false)}>
                        Inicio
                    </NavLink>

                    <NavLink to="/empresa" className={navClass} onClick={() => setAbierto(false)}>
                        La Empresa
                    </NavLink>

                    {/* Acordeón móvil de Servicios */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setServiciosMovilAbierto(!serviciosMovilAbierto)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            <span>Servicios</span>
                            <svg
                                className={`h-4 w-4 transition-transform ${serviciosMovilAbierto ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {serviciosMovilAbierto && (
                            <div className="ml-3 mt-1 flex flex-col gap-1 border-l-2 border-indigo-200 pl-3">
                                {subServicios.map((sub) => (
                                    <NavLink
                                        key={sub.to}
                                        to={sub.to}
                                        end={sub.end}
                                        onClick={() => setAbierto(false)}
                                        className={({ isActive }) =>
                                            `rounded-lg px-2 py-1.5 text-sm transition ${isActive
                                                ? 'font-semibold text-indigo-600 bg-indigo-50'
                                                : 'text-slate-600 hover:text-slate-900'
                                            }`
                                        }
                                    >
                                        {sub.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>

                    <NavLink to="/contacto" className={navClass} onClick={() => setAbierto(false)}>
                        Contacto
                    </NavLink>

                    <div className="my-2 border-t border-slate-200" />

                    {isAuthenticated ? (
                        <div className="flex flex-col gap-2 py-1">
                            <NavLink
                                to="/perfil"
                                className={navClass}
                                onClick={() => setAbierto(false)}
                            >
                                Mi Perfil
                            </NavLink>
                            <span className="text-sm font-medium text-slate-700">
                                Conectado como <strong>{usuario?.nombre}</strong>
                            </span>
                            <button
                                onClick={() => {
                                    logout();
                                    setAbierto(false);
                                }}
                                className="rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 py-1">
                            <NavLink
                                to="/login"
                                className={navClass}
                                onClick={() => setAbierto(false)}
                            >
                                Ingresar
                            </NavLink>
                            <NavLink
                                to="/registro"
                                className={navClass}
                                onClick={() => setAbierto(false)}
                            >
                                Registrarse
                            </NavLink>
                        </div>
                    )}

                    <NavLink
                        to="/admin"
                        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                        onClick={() => setAbierto(false)}
                    >
                        Admin
                    </NavLink>
                </nav>
            )}
        </header>
    );
}

export default Header;


