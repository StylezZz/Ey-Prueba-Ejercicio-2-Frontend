# Guía de Instalación y Ejecución Local

Esta guía documenta los pasos necesarios para ejecutar el proyecto en un entorno de desarrollo local.

## Pre-requisitos

Antes de ejecutar el proyecto, es necesario contar con:
- Node.js versión 18 o superior instalado
- npm (incluido con Node.js) o yarn como gestor de paquetes
- Git para clonar el repositorio
- La API del backend corriendo en `http://localhost:5117` (verificar que esté activa)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd RiskProject
```

### 2. Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias listadas en el `package.json`, incluyendo:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Axios
- Lucide React (iconos)

### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto (si no existe):

```bash
VITE_API_URL=http://localhost:5117/api
```

**Nota:** Si el backend está corriendo en un puerto diferente, ajustar la URL correspondiente.

## Ejecución

### Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Este comando:
- Inicia el servidor de desarrollo de Vite
- Habilita Hot Module Replacement (HMR) para ver cambios en tiempo real
- Abre la aplicación en `http://localhost:5173`

### Acceder a la Aplicación

Una vez el servidor esté corriendo:
1. Abrir el navegador en `http://localhost:5173`
2. Verificar que la API del backend esté corriendo en `http://localhost:5117`
3. La aplicación debería cargar y mostrar la interfaz de gestión de proveedores

## Estructura del Proyecto

```
RiskProject/
├── src/
│   ├── api/              # Configuración de Axios y llamadas API
│   ├── components/       # Componentes React (modales, tablas, forms)
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Páginas principales
│   ├── types/            # Tipos TypeScript
│   └── lib/              # Utilidades
├── public/               # Assets estáticos
├── docs/                 # Documentación
└── package.json          # Dependencias y scripts
```

## Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Generar build de producción (opcional)
npm run build

# Vista previa del build de producción
npm run preview

# Ejecutar linter
npm run lint
```

## Dependencias Principales

El proyecto utiliza las siguientes tecnologías:

- **React 18** - Biblioteca principal para la UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y servidor de desarrollo
- **Tailwind CSS** - Framework de estilos utilitarios
- **shadcn/ui** - Componentes UI accesibles y estilizados
- **Axios** - Cliente HTTP para llamadas API
- **Radix UI** - Primitivos UI sin estilos (base de shadcn/ui)
- **Lucide React** - Librería de iconos

## Configuración del Backend

Para que el frontend funcione correctamente, el backend debe:

1. Estar corriendo en `http://localhost:5117`
2. Tener los siguientes endpoints disponibles:
   - `GET /api/providers` - Lista de proveedores
   - `POST /api/providers` - Crear proveedor
   - `PUT /api/providers/{id}` - Actualizar proveedor
   - `DELETE /api/providers/{id}` - Eliminar proveedor
   - `POST /api/risk/{id}/all` - Screening contra todas las fuentes
   - `POST /api/risk/{id}/source/{source}` - Screening contra fuente específica

3. Tener CORS configurado para aceptar requests desde `http://localhost:5173`

---
Créditos:
- Proyecto desarrollado por Christian Carrillo
