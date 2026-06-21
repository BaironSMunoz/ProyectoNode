const API = 'http://localhost:3000/api';
let USUARIO_ID = null;
let USUARIO_NOMBRE = '';

function uid() { return USUARIO_ID; }
function $(id) { return document.getElementById(id); }
function val(id) { return $(id).value; }
function num(id) { return Number($(id).value); }

// ─── LOGIN ──────────────────────────────────────────────────

async function cargarLoginUsuarios() {
    const lista = $('login-lista');
    try {
        const d = await req('GET', '/usuarios');
        if (!d.length) {
            lista.innerHTML = '<p style="color:#9ca3af;font-size:0.83rem">No hay usuarios. Crea uno primero.</p>';
            return;
        }
        lista.innerHTML = d.map(u => `
        <button class="login-user-btn" onclick="loginComo(${u.id},'${u.nombre_completo.replace(/'/g, "\\'")}')">
            <div class="login-user-avatar">${u.nombre_completo.charAt(0).toUpperCase()}</div>
            <div>
                <div class="login-user-name">${u.nombre_completo}</div>
                <div class="login-user-email">${u.email}</div>
            </div>
        </button>`).join('');
    } catch (e) {
        lista.innerHTML = `<p style="color:#dc2626;font-size:0.83rem">${e.message}</p>`;
    }
}

function loginComo(id, nombre) {
    USUARIO_ID = id;
    USUARIO_NOMBRE = nombre;
    $('topbar-name').textContent = nombre;
    $('topbar-avatar').textContent = nombre.charAt(0).toUpperCase();
    $('login-screen').style.display = 'none';
    $('sidebar').classList.remove('hidden');
    document.querySelector('.layout').style.display = 'flex';
    go('presupuestos');
}

function cerrarSesion() {
    USUARIO_ID = null;
    USUARIO_NOMBRE = '';
    $('login-screen').style.display = '';
    $('sidebar').classList.add('hidden');
    document.querySelector('.layout').style.display = 'none';
    cargarLoginUsuarios();
}

function showCrearUsuario() {
    $('login-screen').style.display = 'none';
    $('login-crear').classList.remove('hidden');
}

function volverLogin() {
    $('login-crear').classList.add('hidden');
    $('login-screen').style.display = '';
}

async function crearDesdeLogin() {
    const nombre_completo = $('lc-nombre').value;
    const email = $('lc-email').value;
    const telefono = $('lc-tel').value;
    if (!nombre_completo || !email) { toast('Nombre y email son obligatorios', false); return; }
    try {
        const d = await req('POST', '/usuarios', { nombre_completo, email, telefono });
        const u = d.usuario;
        $('login-crear').classList.add('hidden');
        loginComo(u.id, u.nombre_completo);
    } catch (e) { toast(e.message, false); }
}

// Iniciar: esconder el layout y cargar usuarios
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.layout').style.display = 'none';
    cargarLoginUsuarios();
});

function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    $(`section-${name}`).classList.add('active');
    $(`nav-${name}`).classList.add('active');
}

function toggleForm(id) { $(id).classList.toggle('hidden'); }

function toast(msg, ok = true) {
    const t = $('toast');
    t.textContent = msg;
    t.className = `toast ${ok ? 'ok' : 'err'}`;
    clearTimeout(t._t);
    t._t = setTimeout(() => t.className = 'toast hidden', 3000);
}

function money(n) { return '$' + Number(n).toLocaleString('es-CL'); }
function mes(m) { return ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][m] || m; }

async function req(method, url, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(API + url, opts);
    const d = await r.json();
    if (!r.ok) throw new Error(d.mensaje || d.message || 'Error');
    return d;
}

// ─── USUARIOS ───────────────────────────────────────────────

async function crearUsuario() {
    const nombre_completo = val('u-nombre'), email = val('u-email'), telefono = val('u-tel');
    if (!nombre_completo || !email) { toast('Nombre y email son obligatorios', false); return; }
    try {
        const d = await req('POST', '/usuarios', { nombre_completo, email, telefono });
        toast(d.message || 'Usuario creado correctamente');
        toggleForm('form-crear-usuario');
        listarUsuarios();
    } catch (e) { toast(e.message, false); }
}

async function listarUsuarios() {
    const c = $('lista-usuarios');
    c.innerHTML = '<p style="color:#9ca3af;padding:12px">Cargando...</p>';
    try {
        const d = await req('GET', '/usuarios');
        if (!d.length) { c.innerHTML = '<div class="empty">No hay usuarios registrados.</div>'; return; }
        c.innerHTML = `
        <div class="list-header">
            <span>ID</span><span>Nombre</span><span>Email</span><span>Teléfono</span><span></span>
        </div>
        ${d.map(u => `
        <div class="list-row">
            <span class="list-id">${u.id}</span>
            <span>${u.nombre_completo}</span>
            <span>${u.email}</span>
            <span>${u.telefono || '—'}</span>
            <span class="list-actions">
                <button class="btn-outline-sm" onclick="editarUsuario(${u.id},'${u.nombre_completo.replace(/'/g, "\\'")}','${u.email}','${u.telefono || ''}')">Actualizar</button>
            </span>
        </div>`).join('')}`;
    } catch (e) { c.innerHTML = `<p style="color:#dc2626;padding:12px">${e.message}</p>`; }
}

function editarUsuario(id, nombre, email, tel) {
    $('put-u-id').value = id;
    $('put-u-nombre').value = nombre;
    $('put-u-email').value = email;
    $('put-u-tel').value = tel;
    const form = $('form-put-usuario');
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function putUsuario() {
    const id = num('put-u-id');
    const nombre_completo = val('put-u-nombre'), email = val('put-u-email'), telefono = val('put-u-tel');
    if (!id || !nombre_completo || !email) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('PUT', `/usuarios/${id}`, { nombre_completo, email, telefono });
        toast(d.mensaje || 'Usuario actualizado');
        toggleForm('form-put-usuario');
        listarUsuarios();
    } catch (e) { toast(e.message, false); }
}

async function cargarDatosPerfil() {
    try {
        const d = await req('GET', '/usuarios');
        const miUser = d.find(u => u.id === uid());
        if (miUser) {
            $('perf-nombre').value = miUser.nombre_completo;
            $('perf-email').value = miUser.email;
            $('perf-tel').value = miUser.telefono || '';
        }
    } catch (e) { toast('Error cargando perfil: ' + e.message, false); }
}

async function guardarPerfil() {
    const nombre_completo = val('perf-nombre'), email = val('perf-email'), telefono = val('perf-tel');
    if (!nombre_completo || !email) { toast('Nombre y email son obligatorios', false); return; }
    try {
        const d = await req('PUT', `/usuarios/${uid()}`, { nombre_completo, email, telefono });
        toast(d.mensaje || 'Perfil actualizado');
        USUARIO_NOMBRE = nombre_completo;
        $('topbar-name').textContent = nombre_completo;
        $('topbar-avatar').textContent = nombre_completo.charAt(0).toUpperCase();
        if (document.getElementById('lista-usuarios')) listarUsuarios();
    } catch (e) { toast(e.message, false); }
}

// ─── CATEGORÍAS ─────────────────────────────────────────────

async function crearCategoria() {
    const nombre = val('cat-nombre'), tipo = val('cat-tipo'), descripcion = val('cat-desc');
    if (!nombre) { toast('El nombre es obligatorio', false); return; }
    try {
        const d = await req('POST', '/categorias', { usuario_id: uid(), nombre, tipo, descripcion });
        toast(d.mensaje || 'Categoría creada');
        toggleForm('form-crear-categoria');
        listarCategorias();
    } catch (e) { toast(e.message, false); }
}

async function listarCategorias() {
    const c = $('lista-categorias');
    c.innerHTML = '<p style="color:#9ca3af;padding:12px">Cargando...</p>';
    try {
        const d = await req('GET', `/categorias/usuario/${uid()}`);
        if (!d.length) { c.innerHTML = '<div class="empty">No hay categorías creadas.</div>'; return; }
        c.innerHTML = d.map(cat => {
            const isIngreso = cat.tipo === 'ingreso';
            return `
            <div class="card">
                <div class="card-stripe ${isIngreso ? 'stripe-green' : 'stripe-red'}"></div>
                <div class="card-head">
                    <div>
                        <div class="card-title">${cat.nombre}</div>
                        <div class="card-sub">ID ${cat.id} · ${cat.descripcion || 'Sin descripción'}</div>
                    </div>
                    <span class="badge ${isIngreso ? 'badge-green' : 'badge-red'}">${isIngreso ? 'Ingreso' : 'Gasto'}</span>
                </div>
            </div>`;
        }).join('');
    } catch(e) { c.innerHTML = `<p style="color:#dc2626;padding:12px">${e.message}</p>`; }
}

async function deleteCategoria() {
    const id = num('del-cat-id');
    if (!id) { toast('Ingresa el ID', false); return; }
    if (!confirm(`¿Eliminar categoría ID ${id}?`)) return;
    try {
        const d = await req('DELETE', `/categorias/${id}`);
        toast(d.mensaje);
        toggleForm('form-delete-categoria');
        listarCategorias();
    } catch (e) { toast(e.message, false); }
}

// ─── MOVIMIENTOS ────────────────────────────────────────────

async function crearMovimiento() {
    const categoria_id = num('mov-cat'), monto = num('mov-monto'), descripcion = val('mov-desc');
    if (!categoria_id || !monto || !descripcion) { toast('Todos los campos son obligatorios', false); return; }
    try {
        const d = await req('POST', '/movimientos', { usuario_id: uid(), categoria_id, monto, descripcion });
        toast(d.mensaje);
        toggleForm('form-crear-movimiento');
        listarMovimientos();
    } catch (e) { toast(e.message, false); }
}

async function listarMovimientos() {
    const c = $('lista-movimientos');
    c.innerHTML = '<p style="color:#9ca3af;padding:12px">Cargando...</p>';
    try {
        const d = await req('GET', `/movimientos/usuario/${uid()}`);
        if (!d.length) { c.innerHTML = '<div class="empty">No hay movimientos registrados.</div>'; return; }
        c.innerHTML = d.map(m => `
            <div class="card">
                <div class="card-stripe stripe-amber"></div>
                <div class="card-head">
                    <div>
                        <div class="card-title">${m.descripcion}</div>
                        <div class="card-sub">ID ${m.id} · Cat. ${m.categoria_id} · ${new Date(m.fecha).toLocaleDateString('es-CL')}</div>
                    </div>
                    <span class="badge badge-amber">${money(m.monto)}</span>
                </div>
                <div class="card-foot">
                    <span class="card-foot-txt">Usuario ${m.usuario_id}</span>
                    <button class="btn-delete" onclick="deleteMovimiento(${m.id})">Eliminar</button>
                </div>
            </div>`).join('');
    } catch (e) { c.innerHTML = `<p style="color:#dc2626;padding:12px">${e.message}</p>`; }
}

async function listarResumen() {
    const c = $('lista-movimientos');
    c.innerHTML = '<p style="color:#9ca3af;padding:12px">Cargando...</p>';
    try {
        const d = await req('GET', `/resumen/usuario/${uid()}`);
        c.innerHTML = `<div class="card" style="grid-column:1/-1">
            <div class="card-stripe stripe-green"></div>
            <div class="card-head"><div class="card-title">Resumen financiero — Usuario ${d.usuario_id}</div></div>
            <div class="amounts">
                ${d.resumen.map(r => `
                <div class="amt-block">
                    <div class="lbl">${r.tipo}</div>
                    <div class="val ${r.tipo.toLowerCase().includes('gasto') ? 'val-red' : 'val-green'}">${money(r.total)}</div>
                </div>`).join('')}
            </div>
        </div>`;
    } catch (e) { c.innerHTML = `<p style="color:#dc2626;padding:12px">${e.message}</p>`; }
}

async function putMovimiento() {
    const id = num('put-mov-id'), categoria_id = num('put-mov-cat'), monto = num('put-mov-monto'), descripcion = val('put-mov-desc');
    if (!id || !categoria_id || !monto || !descripcion) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('PUT', `/movimientos/${id}`, { categoria_id, monto, descripcion });
        toast(d.mensaje);
        toggleForm('form-put-movimiento');
        listarMovimientos();
    } catch (e) { toast(e.message, false); }
}

async function patchMovDesc() {
    const id = num('patch-mov-desc-id'), descripcion = val('patch-mov-desc-val');
    if (!id || !descripcion) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('PATCH', `/movimientos/${id}/descripcion`, { descripcion });
        toast(d.mensaje);
        toggleForm('form-patch-mov-desc');
        listarMovimientos();
    } catch (e) { toast(e.message, false); }
}

async function patchMovMonto() {
    const id = num('patch-mov-monto-id'), monto = num('patch-mov-monto-val');
    if (!id || !monto) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('PATCH', `/movimientos/${id}/monto`, { monto });
        toast(d.mensaje);
        toggleForm('form-patch-mov-monto');
        listarMovimientos();
    } catch (e) { toast(e.message, false); }
}

async function deleteMovimiento(id) {
    if (!confirm(`¿Eliminar el movimiento ID ${id}?`)) return;
    try {
        const d = await req('DELETE', `/movimientos/${id}`);
        toast(d.mensaje);
        listarMovimientos();
    } catch (e) { toast(e.message, false); }
}

// ─── PRESUPUESTOS ───────────────────────────────────────────

async function crearPresupuesto() {
    const categoria_id = num('p-cat'), monto_limite = num('p-monto'), mes = num('p-mes'), anio = num('p-anio');
    if (!categoria_id || !monto_limite) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('POST', '/presupuestos', { usuario_id: uid(), categoria_id, monto_limite, mes, anio });
        toast(d.mensaje);
        toggleForm('form-crear-presupuesto');
        listarPresupuestos();
    } catch (e) { toast(e.message, false); }
}

async function listarPresupuestos() {
    const c = $('lista-presupuestos');
    c.innerHTML = '<p style="color:#9ca3af;padding:12px">Cargando...</p>';
    try {
        const d = await req('GET', `/presupuestos/usuario/${uid()}`);
        if (!d.length) { c.innerHTML = '<div class="empty">No hay presupuestos creados.</div>'; return; }
        c.innerHTML = d.map(p => {
            const pct = Math.min((p.gasto_actual / p.monto_limite) * 100, 100);
            const verde = p.estado === 'en verde';
            return `
            <div class="card">
                <div class="card-stripe ${verde ? 'stripe-green' : 'stripe-red'}"></div>
                <div class="card-head">
                    <div>
                        <div class="card-title">${p.categoria_nombre || 'Cat. ' + p.categoria_id}</div>
                        <div class="card-sub">${mes(p.mes)} ${p.anio} · ID ${p.id}</div>
                    </div>
                    <span class="badge ${verde ? 'badge-green' : 'badge-red'}">${verde ? 'En verde' : 'En rojo'}</span>
                </div>
                <div class="amounts">
                    <div class="amt-block"><div class="lbl">Gastado</div><div class="val ${verde ? 'val-green' : 'val-red'}">${money(p.gasto_actual)}</div></div>
                    <div class="amt-block" style="text-align:right"><div class="lbl">Límite</div><div class="val">${money(p.monto_limite)}</div></div>
                </div>
                <div class="progress-wrap"><div class="progress-fill ${pct >= 100 ? 'over' : ''}" style="width:${pct.toFixed(1)}%"></div></div>
                <div class="card-foot">
                    <span class="card-foot-txt">${pct.toFixed(1)}% utilizado</span>
                    <div style="display:flex;gap:6px">
                        <button class="btn-delete" onclick="deletePresupuesto(${p.id})">Eliminar</button>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (e) { c.innerHTML = `<p style="color:#dc2626;padding:12px">${e.message}</p>`; }
}

async function putPresupuesto() {
    const id = num('put-p-id'), categoria_id = num('put-p-cat'), monto_limite = num('put-p-monto'), mes = num('put-p-mes'), anio = num('put-p-anio');
    if (!id || !categoria_id || !monto_limite) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('PUT', `/presupuestos/${id}`, { categoria_id, monto_limite, mes, anio });
        toast(d.mensaje);
        toggleForm('form-put-presupuesto');
        listarPresupuestos();
    } catch (e) { toast(e.message, false); }
}

async function patchPresupuesto() {
    const id = num('patch-p-id'), monto_limite = num('patch-p-monto');
    if (!id || !monto_limite) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('PATCH', `/presupuestos/${id}/monto`, { monto_limite });
        toast(d.mensaje);
        toggleForm('form-patch-presupuesto');
        listarPresupuestos();
    } catch (e) { toast(e.message, false); }
}

function prefillPatchPresupuesto(id) {
    $('patch-p-id').value = id;
    const form = $('form-patch-presupuesto');
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deletePresupuesto(id) {
    if (!confirm(`¿Eliminar el presupuesto ID ${id}?`)) return;
    try { const d = await req('DELETE', `/presupuestos/${id}`); toast(d.mensaje); listarPresupuestos(); }
    catch (e) { toast(e.message, false); }
}

// ─── METAS ──────────────────────────────────────────────────

async function crearMeta() {
    const nombre = val('m-nombre'), monto_objetivo = num('m-objetivo'), fecha_limite = val('m-fecha') || null;
    if (!nombre || !monto_objetivo) { toast('Nombre y monto son obligatorios', false); return; }
    try {
        const d = await req('POST', '/metas', { usuario_id: uid(), nombre, monto_objetivo, fecha_limite });
        toast(d.mensaje);
        toggleForm('form-crear-meta');
        listarMetas();
    } catch (e) { toast(e.message, false); }
}

async function listarMetas() {
    const c = $('lista-metas');
    c.innerHTML = '<p style="color:#9ca3af;padding:12px">Cargando...</p>';
    try {
        const d = await req('GET', `/metas/usuario/${uid()}`);
        if (!d.length) { c.innerHTML = '<div class="empty">No hay metas creadas.</div>'; return; }
        c.innerHTML = d.map(m => {
            const pct = Math.min(Number(m.porcentaje_progreso || 0), 100);
            const falta = Math.max(Number(m.monto_objetivo) - Number(m.monto_ahorrado), 0);
            const done = m.estado === 'completada', exp = m.estado === 'vencida';
            const bc = done ? 'badge-green' : exp ? 'badge-red' : 'badge-blue';
            const bt = done ? 'Completada' : exp ? 'Vencida' : 'En progreso';
            const sc = done ? 'stripe-green' : exp ? 'stripe-red' : 'stripe-blue';
            const fecha = m.fecha_limite ? new Date(m.fecha_limite).toLocaleDateString('es-CL') : '—';
            return `
            <div class="card">
                <div class="card-stripe ${sc}"></div>
                <div class="card-head">
                    <div><div class="card-title">${m.nombre}</div><div class="card-sub">ID ${m.id} · Límite: ${fecha}</div></div>
                    <span class="badge ${bc}">${bt}</span>
                </div>
                <div class="amounts">
                    <div class="amt-block"><div class="lbl">Ahorrado</div><div class="val ${done ? 'val-green' : ''}">${money(m.monto_ahorrado)}</div></div>
                    <div class="amt-block" style="text-align:center"><div class="lbl">Objetivo</div><div class="val">${money(m.monto_objetivo)}</div></div>
                    <div class="amt-block" style="text-align:right"><div class="lbl">Falta</div><div class="val">${money(falta)}</div></div>
                </div>
                <div class="progress-wrap"><div class="progress-fill ${done ? 'full' : ''}" style="width:${pct}%"></div></div>
                <div class="card-foot">
                    <span class="card-foot-txt">${pct.toFixed(1)}% completado</span>
                    <div style="display:flex;gap:6px">
                        <button class="btn-outline-sm" onclick="prefillPatchMeta(${m.id})">Abonar</button>
                        <button class="btn-delete" onclick="deleteMeta(${m.id})">Eliminar</button>
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (e) { c.innerHTML = `<p style="color:#dc2626;padding:12px">${e.message}</p>`; }
}

async function putMeta() {
    const id = num('put-m-id'), nombre = val('put-m-nombre'), monto_objetivo = num('put-m-objetivo'), fecha_limite = val('put-m-fecha') || null;
    if (!id || !nombre || !monto_objetivo) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('PUT', `/metas/${id}`, { nombre, monto_objetivo, fecha_limite });
        toast(d.mensaje);
        toggleForm('form-put-meta');
        listarMetas();
    } catch (e) { toast(e.message, false); }
}

async function patchMeta() {
    const id = num('patch-m-id'), abono = num('patch-m-abono');
    if (!id || !abono) { toast('Completa todos los campos', false); return; }
    try {
        const d = await req('PATCH', `/metas/${id}/ahorrado`, { abono });
        toast(d.mensaje);
        toggleForm('form-patch-meta');
        listarMetas();
    } catch (e) { toast(e.message, false); }
}

function prefillPatchMeta(id) {
    $('patch-m-id').value = id;
    const form = $('form-patch-meta');
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deleteMeta(id) {
    if (!confirm(`¿Eliminar la meta ID ${id}?`)) return;
    try { const d = await req('DELETE', `/metas/${id}`); toast(d.mensaje); listarMetas(); }
    catch (e) { toast(e.message, false); }
}
