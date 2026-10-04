// Empresa.jsx - Página de información sobre la empresa.

function Empresa() {
    return (
        <div className="space-y-8">
            <section>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">Institucional</p>
                <h1 className="mb-4 text-4xl font-bold text-slate-900">La Empresa</h1>
                <p className="max-w-3xl text-lg text-slate-600">
                    Somos un equipo de desarrollo que arma proyectos web para aprender y aplicar
                    React, Express y bases de datos en un entorno real de clase.
                </p>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="mb-2 text-xl font-semibold text-slate-900">Misión</h2>
                    <p className="text-slate-600">
                        Enseñar desarrollo web con ejemplos claros, código prolijo y una estructura fácil de seguir.
                    </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="mb-2 text-xl font-semibold text-slate-900">Valores</h2>
                    <p className="text-slate-600">
                        Claridad, práctica y trabajo en equipo. Cada sección de este sitio sirve como base para seguir ampliando.
                    </p>
                </article>
            </section>
        </div>
    );
}

export default Empresa;
