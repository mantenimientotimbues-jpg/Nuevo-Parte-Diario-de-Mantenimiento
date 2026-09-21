# SGM — Prototipo Funcional (Fase 1)
### Sistema de Gestión de Mantenimiento — AGD Planta Timbúes

Este proyecto es un **prototipo funcional navegable** del Sistema de Gestión de
Mantenimiento (SGM) descripto en el **Documento de Requerimientos Funcionales
y Técnicos (DRF) v1.4**. Implementa la lógica de negocio real (validaciones,
cálculos, reglas de continuidad) con datos de demostración, para poder
**validar el flujo funcional con los usuarios reales** (supervisores,
técnicos) y **acelerar la aprobación del proyecto** ante el área de Sistemas.

> ⚠️ **Esto NO es la aplicación de producción.** No tiene backend real, no se
> conecta a JD Edwards, no tiene base de datos ni autenticación real. Ver la
> sección **"Qué es real y qué está simulado"** más abajo.

---

## 🚀 Cómo ejecutarlo en GitHub Codespaces

1. Subí el contenido de esta carpeta a un repositorio de GitHub (o creá un
   Codespace directamente sobre un repo vacío y pegá estos archivos).
2. Abrí el repositorio y hacé clic en **Code → Codespaces → Create codespace
   on main**.
3. Cuando el Codespace termine de iniciar (te abre un VS Code en el navegador),
   abrí una terminal y ejecutá:

   ```bash
   npm install
   npm run dev
   ```

4. Codespaces va a detectar que se abrió el puerto **5173** y te va a mostrar
   un aviso ("Open in Browser") — hacé clic ahí. También podés ir a la
   pestaña **"Ports"** y abrir el puerto manualmente.
5. Ya deberías ver el Dashboard del SGM funcionando en el navegador.

## 💻 Cómo ejecutarlo en tu computadora (alternativa)

Requiere tener [Node.js](https://nodejs.org/) 18 o superior instalado.

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173` en el navegador.

## ✅ Cómo correr las pruebas automatizadas

La lógica de negocio (validaciones de OT/CC, cálculo de horas, continuidad de
Pase de Turno, permisos por rol, etc.) tiene **41 pruebas automatizadas**,
escritas con el módulo nativo `node:test` (no requieren instalar nada extra):

```bash
npm test
```

También podés verificar la integridad de los datos de demostración:

```bash
npm run check:data
```

---

## 🧭 Cómo navegar el prototipo

- El menú lateral (azul marino) tiene los **10 módulos del DRF**.
- Abajo del menú hay un selector de **"Rol activo (simulado)"**: cambialo
  entre Administrador / Supervisor / Técnico / Consulta para ver cómo cambia
  el acceso a cada módulo (RBAC), tal como está definido en la sección 9 del
  DRF. Como no hay backend de autenticación real, este selector reemplaza el
  login.
- Los datos se guardan en el `localStorage` del navegador durante la sesión.
  Si querés reiniciar todo a los valores de demostración iniciales, andá a
  **Configuración → Zona de demostración → Reiniciar datos de demostración**
  (rol Administrador).

### Flujos recomendados para probar

1. **Formulario de Carga** (rol Técnico o Administrador): cargá una
   intervención sobre una OT existente (por ejemplo `OT10001`), marcá "Es OT
   Bolsa" para ver el modal de autocompletado, o dejá el estado en
   "Pendiente" para verla aparecer en **Pase de Turno**.
2. **Pedidos de Trabajo**: elegí un pedido sin registrar (por ejemplo
   `PED20001`) y hacé clic en "Registrar trabajo". Notá que el Equipo se
   autocompleta y que no se pide Número de OT/CC.
3. Cambiá el rol a **Supervisor** y volvé a Pedidos de Trabajo: vas a ver el
   botón **"Completar OT/CC"** sobre el registro que acabás de crear.
4. **Orden de Trabajo**: probá con `OT10002` (no tiene CC informado por JDE)
   vs. `OT10001` (sí lo tiene), para ver la diferencia de autocompletado.
5. **Dashboard**: los indicadores y gráficos se recalculan en tiempo real a
   medida que cargás datos.

---

## 🗺️ Módulos implementados y su relación con el DRF

| Módulo (menú) | Sección DRF | Estado |
|---|---|---|
| Inicio (Dashboard) | 11.1, 12 | Completo, con datos reales calculados |
| Historial | 11.2 | Completo (grilla, filtros, orden, export CSV) |
| Pase de Turno | 11.3 | Completo (continuidad multi-turno) |
| Formulario de Carga | 11.4 | Completo (validaciones OT/CC, OT Bolsa, adjuntos) |
| Pedidos de Trabajo | 11.5 | Completo (registro rápido + completar OT/CC) |
| Orden de Trabajo | 11.6 | Completo (registro rápido + completar CC) |
| Equipos / Activos | 11.7 | Funcional (listado + alta simple) |
| Horas Administradas | 11.8 | Funcional (agregación real + gráfico) |
| Proveedores | 11.9 | Funcional (alta + listado) |
| Configuración | 11.10 | Funcional (maestros bloqueados, importación simulada, auditoría) |

---

## 🔍 Qué es real y qué está simulado

Esto es lo más importante para entender el alcance del prototipo:

### Es lógica de negocio REAL (no maquetas)
- Validación de Número de OT (7 caracteres, existe en el listado de JDE, no
  bloqueada) y de Número de CC (6 caracteres, no bloqueada).
- Cálculo automático de horas hombre (total, AGD, terceros) según operarios y
  tramo horario.
- Lógica de **OT Bolsa** (sector + especialidad + tipo de mantenimiento →
  autocompletar OT/CC).
- Continuidad entre turnos (**Pase de Turno**) preservando el `id_original` de
  la cadena, sin importar si el origen fue el Formulario de Carga, un Pedido
  de Trabajo o el registro rápido sobre una OT.
- El mecanismo de **registro rápido** sobre Pedidos y sobre Órdenes de
  Trabajo, con autocompletado de Equipo y (cuando corresponde) de CC.
- La matriz de **permisos por rol** (RBAC) de la sección 9 del DRF.
- Los cálculos del **Dashboard** (KPIs, gráficos) y de **Horas
  Administradas**.

### Está SIMULADO (mock) — hay que reemplazarlo para producción
- **No hay backend ni base de datos.** Todo vive en memoria del navegador
  (React) y se persiste en `localStorage` solo para no perder los datos al
  refrescar la página. Un backend real (Node.js/Express + SQL Server o
  PostgreSQL, según el DRF sección 4) debe reemplazar `src/state/AppContext.jsx`.
- **No hay autenticación real.** El selector de rol en la barra lateral es un
  reemplazo de demostración; en producción esto debe integrarse con Active
  Directory/LDAP (DRF sección 4.2, RNF-01).
- **La importación de JD Edwards está simulada.** El botón en Configuración
  no lee ningún archivo real; solo registra una entrada de auditoría de
  ejemplo. Los datos de OT y Pedidos de Trabajo son fijos (`src/data/seed.js`).
- **Los archivos adjuntos no se suben a ningún servidor.** Solo se guarda su
  nombre/tamaño/tipo en memoria (simulando lo que sería la tabla
  `Historial_Adjuntos`); no hay almacenamiento real de archivos.
- **La exportación es a CSV, no a `.xlsx` real.** Un archivo CSV se abre
  perfectamente en Excel, pero generar un `.xlsx` binario real requeriría una
  librería adicional (por ejemplo, ExcelJS, mencionada en el DRF sección 8).
- **El Formulario de Carga usa un solo tramo horario** (inicio/fin), en lugar
  de los dos tramos que contempla la grilla histórica del DRF (sección 11.2,
  campos "Fecha inicio_2/fin_2"). Se simplificó para el prototipo; agregarlo
  es directo si se necesita preservar exactamente esa estructura legada.

---

## 📁 Estructura del proyecto

```
sgm-prototype/
├── src/
│   ├── logic/            # Lógica de negocio PURA (sin React), 100% testeada
│   │   ├── ids.js
│   │   ├── validaciones.js     # RF-26 a RF-29, RF-32/33
│   │   ├── horas.js            # RF-25 (cálculo de horas hombre)
│   │   ├── otBolsa.js          # RF-30/31
│   │   ├── historial.js        # Continuidad, Pase de Turno, completar OT/CC
│   │   ├── permisos.js         # Matriz de roles (sección 9 del DRF)
│   │   ├── dashboard.js        # Cálculo de KPIs
│   │   ├── charts.js           # Geometría de gráficos SVG
│   │   ├── horasAdministradas.js
│   │   └── __tests__/          # 41 pruebas automatizadas (node:test)
│   ├── data/seed.js       # Datos de demostración (maestros + JDE simulado)
│   ├── state/AppContext.jsx    # Estado global (reemplaza al backend real)
│   ├── components/        # Componentes de UI reutilizables
│   └── pages/              # Una página por módulo del menú
├── tools/                  # Scripts de control de calidad (no se despliegan)
├── package.json
└── README.md                # Este archivo
```

---

## 🛠️ Próximos pasos sugeridos (para el equipo de Sistemas)

1. Revisar `src/logic/*.js`: esta carpeta concentra **todas** las reglas de
   negocio y es la más importante para auditar; está desacoplada de React y
   se puede reutilizar casi tal cual en un backend Node.js real.
2. Definir el motor de base de datos (SQL Server/PostgreSQL) y migrar el
   modelo de `src/data/seed.js` a tablas reales, según el modelo conceptual
   de la sección 7 del DRF.
3. Reemplazar `AppContext.jsx` por llamadas reales a una API REST.
4. Definir con el equipo que administra JD Edwards el formato exacto de
   exportación, para construir el módulo de importación real (sección 8 y
   11.10 del DRF).
5. Integrar autenticación corporativa (AD/LDAP) en reemplazo del selector de
   rol de demostración.
6. Sumar pruebas de aceptación de usuario (UAT) con supervisores y técnicos
   reales usando este mismo prototipo como base de la conversación.
