// Inicio.jsx - Página principal de la web.

import { Link } from 'react-router-dom';

function Inicio() {
    return (
        <div className="space-y-10">
            <section className="rounded-3xl bg-slate-900 px-8 py-16 text-white">
                <p className="mb-3 text-sm uppercase tracking-[0.2em] text-indigo-300">Sitio institucional</p>
                <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Bienvenidos a INTEGRADO</h1>
                <p className="max-w-2xl text-lg text-slate-300">
                    Una web de ejemplo para practicar React Router, componentes y estilos con Tailwind CSS.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/servicios" className="rounded-xl bg-indigo-500 px-5 py-3 font-medium text-white hover:bg-indigo-400">
                        Ver servicios
                    </Link>
                    <Link to="/contacto" className="rounded-xl bg-white/10 px-5 py-3 font-medium text-white hover:bg-white/20">
                        Contactarnos
                    </Link>
                </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-xl font-semibold text-slate-900">La empresa</h2>
                    <p className="text-slate-600">Conocé quiénes somos, nuestra historia y cómo trabajamos.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-xl font-semibold text-slate-900">Servicios</h2>
                    <p className="text-slate-600">Desarrollo web, paneles de gestión y acompañamiento técnico.</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-2 text-xl font-semibold text-slate-900">Contacto</h2>
                    <p className="text-slate-600">Escribinos para consultas, presupuestos o soporte.</p>
                </article>
            </section>
        </div>
    );
}

export default Inicio;
