# Sistema de Gestión de Riesgo de Proveedores

Este es un proyecto web que hice para gestionar proveedores y hacer análisis de riesgo (screening). Está hecho con React + TypeScript y se conecta a una API en .NET que corre en el backend.

## ¿Qué hace?

El sistema permite gestionar proveedores y hacer cruces de datos contra fuentes de riesgo externas:

### Gestión de Proveedores
- Agregar nuevos proveedores
- Ver toda la info de un proveedor en un modal
- Editar los datos de un proveedor existente
- Eliminar proveedores (con confirmación previa)
- Buscar y filtrar proveedores por nombre, tax ID o país
- Paginación de resultados (10 proveedores por página)

### Análisis de Riesgo (Screening)
- **Cruce automático** contra múltiples fuentes de datos de riesgo
- Seleccionar entre 1 y 3 fuentes para hacer el screening
- Opción de buscar en todas las fuentes simultáneamente
- Visualización de resultados en tablas detalladas
- Ver el número de coincidencias (hits) por cada fuente
- Tablas con scroll horizontal para ver todos los campos

#### Fuentes de Riesgo Disponibles
1. **OFAC**
   - Campos: Name, Name URL, Address, Type, Programs, List, Score
   
2. **Offshore Leaks** 
   - Campos: Entity, Entity URL, Jurisdiction, Linked To, Data From
   
3. **The World Bank**
   - Campos: Firm Name, Address, Country, From Date, To Date, Grounds

## Tecnologías que usé

- **React 18** con TypeScript
- **Vite** para el servidor de desarrollo
- **Tailwind CSS** para los estilos
- **shadcn/ui** para los componentes UI (botones, tablas, modales, etc.)
- **Axios** para las llamadas a la API
- **Lucide React** para los íconos
- **Radix UI** para componentes accesibles (checkboxes, dialogs)

## Cómo correr el proyecto
1. Clona este repositorio
    ```bash
    git clone
    ```
2. Instala las dependencias
    ```bash
    npm install
    ```
3. Corre el servidor de desarrollo
    ```bash
    npm run dev
    ```
4. Abre tu navegador en `http://localhost:5173`
5. Asegúrate de que la API en .NET esté corriendo para que el frontend pueda comunicarse con la misma.

## Estructura del proyecto

```
src/
├── api/
│   ├── axios.ts              # Configuración de Axios (baseURL, interceptors)
│   └── providers.api.ts      # Funciones para llamar a la API (CRUD + Screening)
├── components/
│   ├── ui/                   # Componentes de shadcn/ui (button, dialog, table, etc.)
│   ├── ProviderForm.tsx      # Formulario para crear/editar proveedores
│   ├── ProviderTable.tsx     # Tabla con lista de proveedores
│   ├── ProviderDetailsModal.tsx  # Modal para ver detalles de un proveedor
│   └── RiskModal.tsx         # Modal personalizado para screening de riesgo
├── hooks/
│   └── useProviders.ts       # Custom hook para gestionar estado de proveedores
├── pages/
│   └── ProvidersPage.tsx     # Página principal con toda la funcionalidad
├── types/
│   ├── provider.ts           # Tipos TypeScript para Provider
│   └── risk.ts               # Tipos TypeScript para RiskResponse
└── lib/
    └── utils.ts              # Funciones utilitarias (cn para clases CSS)
```

# Cómo Funciona

## Gestión de Proveedores

### Agregar un Proveedor
1. Click en el botón **"Add Provider"** (arriba a la derecha)
2. Llena el formulario:
   - **Legal Name** y **Tax ID** son obligatorios
   - Puedes agregar: Trade Name, Email, Phone, Address, Country, Annual Revenue
3. Click en "Add Provider"
4. El formulario tiene validación, así que no te dejará enviar datos inválidos
5. La lista se actualiza automáticamente

### Ver Detalles
1. Click en el ícono de ojo (**View**) en cualquier fila
2. Se abre un modal con toda la información completa del proveedor
3. Click en "Close" o presiona ESC para cerrar

### Editar 
1. Click en el ícono de lápiz (**Edit**)
2. El formulario se abre prellenado con los datos actuales
3. Cambia lo que necesites
4. Click en "Save Changes"
5. La lista se actualiza automáticamente

### Eliminar
1. Click en el botón rojo **Delete** 
2. Sale un popup de confirmación que te muestra qué proveedor vas a eliminar
3. Click en "Delete Provider" para confirmar o "Cancel" para cancelar
4. La lista se actualiza automáticamente

### Buscar y Filtrar
- **Buscador**: Escribe en el campo de búsqueda para filtrar por:
  - Legal Name
  - Trade Name
  - Tax ID
- **Filtro por país**: Usa el dropdown "Country" para filtrar por país específico
- **Limpiar filtros**: Click en la X para resetear búsqueda y filtros

---

## Análisis de Riesgo (Screening)

El screening es el proceso de **cruzar datos** del proveedor contra fuentes externas de riesgo para detectar coincidencias (matches) con listas de sanciones, offshore leaks, empresas vetadas, etc.

### ¿Cómo hacer un Screening?

1. **Abrir el modal de Screening**
   - Click en el botón con ícono de escudo (**Screening**) en la fila del proveedor que quieres analizar
   - Se abre un modal a pantalla completa

2. **Seleccionar fuentes** (Sidebar izquierdo)
   - Puedes seleccionar entre **1 y 3 fuentes** específicas
   - O seleccionar **"All Sources (Automatic)"** para buscar en todas
   - La búsqueda se ejecuta **automáticamente** al seleccionar

3. **Ver resultados**
   - **Alerta de riesgo**: Muestra si se detectó riesgo o no (verde = sin riesgo, rojo = riesgo detectado)
   - **Total hits**: Número total de coincidencias encontradas
   - **Summary by Source**: Tabla resumen con hits por cada fuente
   - **Tablas detalladas**: Una tabla por cada fuente con matches, mostrando todos los campos

4. **Navegar en las tablas**
   - Las tablas tienen **scroll horizontal** para ver todas las columnas
   - La primera columna (#) se queda fija al hacer scroll
   - **Paginación**: Usa los botones First/Previous/Next/Last para navegar entre páginas (10 resultados por página)
   - Pasa el mouse sobre los campos para ver el contenido completo

5. **Cerrar el modal**
   - Click en la X (arriba a la derecha)
   - O presiona la tecla **ESC**
   - O click fuera del modal (en el área gris)

### Ejemplo de interpretación de resultados

**Escenario 1: Sin riesgo**
```
No Risk Found
Total hits: 0

Todas las fuentes muestran "0 hits" y badge "CLEAR"
```
→ El proveedor NO aparece en ninguna lista de riesgo

**Escenario 2: Riesgo detectado**
```
Risk Detected
Total hits: 5

OFAC: 2 hits - MATCH
Offshore Leaks: 3 hits - MATCH
The World Bank: 0 hits - CLEAR
```
→ El proveedor tiene coincidencias en OFAC (2) y Offshore Leaks (3)
→ Debes revisar los detalles en las tablas para evaluar si es el mismo proveedor o coincidencia de nombre

### ¿Qué significan los campos de cada fuente?

#### OFAC
Lista de personas y entidades sancionadas por el gobierno de EE.UU.
- **Name**: Nombre de la entidad sancionada
- **Name URL**: Link a la página de OFAC con más detalles
- **Address**: Dirección registrada
- **Type**: Tipo (Entity = empresa, Individual = persona)
- **Programs**: Programas de sanciones (ej: CUBA, SYRIA, etc.)
- **List**: Lista específica (SDN = Specially Designated Nationals)
- **Score**: Nivel de coincidencia (100 = match exacto)

#### Offshore Leaks
Base de datos de empresas offshore reveladas por investigaciones periodísticas (Panama Papers, Paradise Papers, etc.)
- **Entity**: Nombre de la entidad offshore
- **Entity URL**: Link a la investigación
- **Jurisdiction**: País donde está registrada
- **Linked To**: País/persona a la que está vinculada
- **Data From**: Fuente de la filtración (Panama Papers, Paradise Papers, etc.)

#### The World Bank
Lista del Banco Mundial de empresas vetadas por corrupción o fraude
- **Firm Name**: Nombre de la empresa
- **Address**: Dirección
- **Country**: País
- **From Date**: Fecha de inicio del veto
- **To Date**: Fecha de fin del veto
- **Grounds**: Razón del veto (ej: "Cross Debarment: IDB") 

# Endpoints de la API

## Gestión de Proveedores
- **GET** `/api/Providers` - Obtiene la lista completa de proveedores
- **POST** `/api/Providers` - Crea un nuevo proveedor
- **PUT** `/api/Providers/{id}` - Actualiza un proveedor existente
- **DELETE** `/api/Providers/{id}` - Elimina un proveedor

## Análisis de Riesgo (Screening)

### Buscar en todas las fuentes
```
POST /api/risk/{providerId}/all
```
- **Descripción**: Ejecuta screening del proveedor en TODAS las fuentes simultáneamente
- **Parámetro**: `providerId` - ID del proveedor a analizar
- **Respuesta**: Objeto JSON con resultados combinados de todas las fuentes

**Ejemplo de uso:**
```javascript
const response = await fetch('http://localhost:5000/api/risk/1/all', {
  method: 'POST'
});
const resultados = await response.json();
```

### Buscar en fuente específica
```
POST /api/risk/{providerId}/source/{sourceName}
```
- **Descripción**: Ejecuta screening solo en la fuente especificada
- **Parámetros**:
  - `providerId` - ID del proveedor a analizar
  - `sourceName` - Nombre de la fuente (valores válidos: `ofac`, `offshore-leaks`, `world-bank`)
- **Respuesta**: Objeto JSON con resultados de la fuente seleccionada
- **Error 400**: Si la fuente no es válida

**Ejemplo de uso:**
```javascript
// Buscar solo en OFAC
const response = await fetch('http://localhost:5000/api/risk/1/source/ofac', {
  method: 'POST'
});
const resultados = await response.json();
```

### Formato de respuesta del screening

```json
{
  "source": "OFAC",
  "query": "Argentina",
  "hits": 1,
  "results": [
    {
      "name": "CRYMSA - ARGENTINA, S.A.",
      "name_url": "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=589",
      "address": "",
      "type": "Entity",
      "programs": "CUBA",
      "list": "SDN",
      "score": "100"
    }
  ],
  "timestamp": "2026-01-02T21:05:43.167946",
  "message": "Se encontraron 1 resultado(s) para 'Argentina' en OFAC",
  "error": null
}
```

---

# Cómo funciona el código

## Flujo de datos del Screening

1. **Usuario hace click en "Screening"** 
   → `ProvidersPage.tsx` abre el `RiskModal` y le pasa el provider

2. **Usuario selecciona fuentes en el RiskModal**
   → `handleSourceToggle()` actualiza el estado `selectedSources`

3. **useEffect detecta cambio en selectedSources**
   → Ejecuta automáticamente `handleScreening()`

4. **handleScreening() decide qué endpoint llamar:**
   - Si eligió "All": llama `runRiskAll(providerId)` 
   - Si eligió fuentes específicas: llama `runRiskMultipleSources(providerId, sources)`

5. **runRiskMultipleSources hace múltiples llamadas en paralelo:**
   ```typescript
   const promises = sources.map(source => runRiskBySource(id, source));
   const responses = await Promise.all(promises);
   ```
   → Combina todos los resultados en un solo objeto `RiskResponse`

6. **Se actualiza el estado `result`**
   → React re-renderiza el modal con las tablas de resultados

7. **Las tablas se generan dinámicamente:**
   - `SOURCE_COLUMNS` define las columnas para cada fuente
   - `normalizeSourceName()` mapea el nombre del backend a la key del frontend
   - `getValue()` extrae el valor de cada campo del resultado

## Componentes principales

### RiskModal.tsx
Modal completamente personalizado (sin shadcn Dialog) que:
- Ocupa toda la pantalla
- Tiene layout de 2 columnas (sidebar + contenido)
- Maneja el estado de: fuentes seleccionadas, loading, resultado, error, paginación
- Bloquea el scroll del body cuando está abierto
- Cierra con ESC, click en X, o click en el overlay

### useProviders.ts
Custom hook que maneja:
- Estado de la lista de proveedores
- Carga inicial con `useEffect`
- Funciones CRUD: `addProvider`, `editProvider`, `removeProvider`
- Ordenamiento automático por fecha (más reciente primero)

### providers.api.ts
Funciones para llamar a la API:
- **CRUD básico**: `getProviders`, `createProvider`, `updateProvider`, `deleteProvider`
- **Screening**: `runRiskAll`, `runRiskBySource`, `runRiskMultipleSources`
- Todas devuelven Promises con tipos TypeScript

---

# Configuración del proyecto

## Variables de entorno
El archivo `src/api/axios.ts` tiene la baseURL hardcodeada:
```typescript
const api = axios.create({
  baseURL: "http://localhost:5117/api",
});
```

**Para cambiar la URL del backend:**
1. Abre `src/api/axios.ts`
2. Cambia el `baseURL` al endpoint correcto
3. O crea un archivo `.env` con:
   ```
   VITE_API_URL=http://tu-backend.com/api
   ```
4. Y actualiza axios.ts:
   ```typescript
   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5117/api"
   ```
---

# Troubleshooting (Problemas comunes)

## El frontend no se conecta al backend
**Problema:** Errores de CORS o "Network Error"

**Solución:**
1. Verifica que el backend esté corriendo
2. Revisa que la URL en `axios.ts` sea correcta
3. El backend debe tener CORS habilitado para `http://localhost:5173`

## Las tablas de screening no muestran columnas
**Problema:** Solo aparece "#" y "Data"

**Solución:**
- El nombre de la fuente del backend no coincide con el mapeo en `SOURCE_NAME_MAP`
- Revisa la consola del navegador, debe decir el nombre que viene del backend
- Agrega ese nombre al mapa en `RiskModal.tsx`:
  ```typescript
  const SOURCE_NAME_MAP: Record<string, string> = {
    "Nombre del Backend": "nombre-normalizado",
  };
  ```

## Los resultados no se muestran en el screening
**Problema:** El modal dice "No matches found" pero sí hay hits

**Solución:**
- Revisa la consola del navegador
- Verifica que el backend devuelva el formato correcto:
  ```json
  {
    "source": "OFAC",
    "hits": 1,
    "results": [...]
  }
  ```

---
# Créditos
- Desarrollado por Christian Carrillo
