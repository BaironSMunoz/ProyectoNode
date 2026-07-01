

const SECTIONS = {

    presupuestos: `
<div class="page-header">
    <h1>Presupuestos Mensuales</h1>
    <p>Límite de gasto por categoría y mes</p>
    <button class="btn-green" onclick="toggleForm('form-crear-presupuesto')">+ Nuevo</button>
</div>

<div id="form-crear-presupuesto" class="form-card hidden">
    <h3>Crear presupuesto</h3>
    <div class="form-row">
        <div class="field"><label>Categoría</label><select id="p-cat"><option value="">Cargando categorías...</option></select></div>
        <div class="field"><label>Monto límite ($)</label><input type="number" id="p-monto" placeholder="Ej: 100000" /></div>
        <div class="field"><label>Mes</label><select id="p-mes">${mesOptions()}</select></div>
        <div class="field"><label>Año</label><input type="number" id="p-anio" value="2026" /></div>
    </div>
    <div class="form-actions">
        <button class="btn-green" onclick="crearPresupuesto()">Guardar</button>
        <button class="btn-outline" onclick="toggleForm('form-crear-presupuesto')">Cancelar</button>
    </div>
</div>

<div class="actions-bar">
    <button class="btn-outline" onclick="listarPresupuestos()">Cargar presupuestos</button>
</div>
<div id="lista-presupuestos" class="grid"></div>
`,

    // ─────────────────────────────────────────────────────────

    metas: `
<div class="page-header">
    <h1>Metas de Ahorro</h1>
    <p>Objetivos financieros a largo plazo</p>
    <button class="btn-green" onclick="toggleForm('form-crear-meta')">+ Nueva</button>
</div>

<div id="form-crear-meta" class="form-card hidden">
    <h3>Crear meta</h3>
    <div class="form-row">
        <div class="field"><label>Nombre</label><input type="text" id="m-nombre" placeholder="Ej: Comprar PC" /></div>
        <div class="field"><label>Monto objetivo ($)</label><input type="number" id="m-objetivo" placeholder="Ej: 800000" /></div>
        <div class="field"><label>Fecha límite (opcional)</label><input type="date" id="m-fecha" /></div>
    </div>
    <div class="form-actions">
        <button class="btn-green" onclick="crearMeta()">Guardar</button>
        <button class="btn-outline" onclick="toggleForm('form-crear-meta')">Cancelar</button>
    </div>
</div>

<div class="actions-bar">
    <button class="btn-outline" onclick="listarMetas()">Cargar metas</button>
</div>
<div id="lista-metas" class="grid"></div>
`,

    // ─────────────────────────────────────────────────────────

    movimientos: `
<div class="page-header">
    <h1>Movimientos</h1>
    <p>Registro de ingresos y gastos</p>
    <button class="btn-green" onclick="toggleForm('form-crear-movimiento')">+ Nuevo</button>
</div>

<div id="form-crear-movimiento" class="form-card hidden">
    <h3>Registrar movimiento</h3>
    <div class="form-row">
        <div class="field"><label>Categoría</label><select id="mov-cat"></select></div>
        <div class="field"><label>Monto ($)</label><input type="number" id="mov-monto" placeholder="Ej: 15000" /></div>
        <div class="field"><label>Descripción</label><input type="text" id="mov-desc" placeholder="Ej: Almuerzo" /></div>
    </div>
    <div class="form-actions">
        <button class="btn-green" id="btn-guardar-movimiento" onclick="crearMovimiento()">Guardar</button>
        <button class="btn-outline" onclick="toggleForm('form-crear-movimiento')">Cancelar</button>
    </div>
</div>

<div class="actions-bar">
    <button class="btn-outline" onclick="listarMovimientos()">Cargar movimientos</button>
    <button class="btn-outline" onclick="listarResumen()">Ver resumen</button>
</div>
<div id="lista-movimientos" class="grid"></div>
`,

    // ─────────────────────────────────────────────────────────

    categorias: `
<div class="page-header">
    <h1>Categorías</h1>
    <p>Clasificaciones de ingresos y gastos</p>
    <button class="btn-green" onclick="toggleForm('form-crear-categoria')">+ Nueva</button>
</div>

<div id="form-crear-categoria" class="form-card hidden">
    <h3>Crear categoría</h3>
    <div class="form-row">
        <div class="field"><label>Nombre</label><input type="text" id="cat-nombre" placeholder="Ej: Alimentación" /></div>
        <div class="field"><label>Tipo</label><select id="cat-tipo"><option value="gasto">Gasto</option><option value="ingreso">Ingreso</option></select></div>
        <div class="field"><label>Descripción (opcional)</label><input type="text" id="cat-desc" placeholder="Descripción" /></div>
    </div>
    <div class="form-actions">
        <button class="btn-green" onclick="crearCategoria()">Guardar</button>
        <button class="btn-outline" onclick="toggleForm('form-crear-categoria')">Cancelar</button>
    </div>
</div>

    <div class="actions-bar">
        <button class="btn-outline" onclick="listarCategorias()">Cargar categorías</button>
    </div>
    <div id="lista-categorias" class="grid"></div>
`,

    // ─────────────────────────────────────────────────────────

    usuarios: `
<div class="page-header">
    <h1>Usuarios</h1>
    <p>Listado de todos los perfiles</p>
</div>
<div id="lista-usuarios" class="data-list"></div>
`,

    // ─────────────────────────────────────────────────────────

    perfil: `
<div class="page-header">
    <h1>Mi Perfil</h1>
    <p>Actualiza tus datos personales (PUT)</p>
</div>

<div class="form-card">
    <h3>Mis datos</h3>
    <div class="form-row">
        <div class="field"><label>Nombre completo</label><input type="text" id="perf-nombre" placeholder="Tu nombre" /></div>
        <div class="field"><label>Email</label><input type="email" id="perf-email" placeholder="tu@email.com" /></div>
        <div class="field"><label>Teléfono</label><input type="text" id="perf-tel" placeholder="912345678" /></div>
    </div>
    <div class="form-actions">
        <button class="btn-green" onclick="guardarPerfil()">Guardar cambios</button>
    </div>
</div>
`
};

// genera las opciones de mes
function mesOptions() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses.map((m, i) => `<option value="${i + 1}" ${i === 5 ? 'selected' : ''}>${m}</option>`).join('');
}

// navegacion
const AUTO_LOAD = {
    presupuestos: () => listarPresupuestos(),
    metas: () => listarMetas(),
    movimientos: () => listarMovimientos(),
    categorias: () => listarCategorias(),
    usuarios: () => listarUsuarios(),
    perfil: () => cargarDatosPerfil()
};

function go(name) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const navItem = document.getElementById(`nav-${name}`);
    if (navItem) navItem.classList.add('active');
    document.getElementById('content').innerHTML = SECTIONS[name];
    if (AUTO_LOAD[name]) AUTO_LOAD[name]();
}
