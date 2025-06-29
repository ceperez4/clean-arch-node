# Proyecto Backend con Node.js y Arquitectura Limpia

Este proyecto es una implementación de una API RESTful en Node.js y TypeScript, diseñada como un portafolio para demostrar los principios de la **Arquitectura Limpia (Clean Architecture)**. El objetivo principal es mostrar cómo se puede construir un sistema desacoplado, mantenible, escalable e independiente del framework, la base de datos y la UI.

Una característica clave de este proyecto es su capacidad para intercambiar frameworks web (como **Express** y **Fastify**) con un esfuerzo mínimo, sin afectar las capas de lógica de negocio y de dominio.

## ✨ Conceptos Clave de la Arquitectura

La estructura del proyecto se basa en los principios de la Arquitectura Limpia de Robert C. Martin (Uncle Bob). La regla principal es la **Regla de la Dependencia**: las dependencias del código fuente solo pueden apuntar hacia adentro. Nada en un círculo interno puede saber nada sobre algo en un círculo externo.

Este proyecto está organizado en las siguientes capas (de adentro hacia afuera):

1.  **Capa de Dominio (Domain):** Es el núcleo de la aplicación. Contiene las entidades (`user.ts`), las interfaces de los repositorios (`userRepository.ts`) y los errores de dominio. No depende de ninguna otra capa.

2.  **Capa de Aplicación (Application):** Contiene la lógica de negocio y los casos de uso (`userCreateUseCase.ts`). Orquesta el flujo de datos desde y hacia las entidades. Define los DTOs (Data Transfer Objects) y los errores específicos de la aplicación. Depende únicamente de la capa de Dominio.

3.  **Capa de Infraestructura (Infrastructure):** Es la capa más externa. Contiene las implementaciones concretas de las abstracciones definidas en las capas internas. Aquí se encuentran los controladores de Express y Fastify, las rutas, la implementación de los repositorios (en memoria, PostgreSQL), y otros servicios externos. Esta capa depende de la capa de Aplicación y Dominio.

![Clean Architecture Diagram](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)
*Diagrama por Robert C. Martin (Uncle Bob)*

## 📂 Estructura del Proyecto

La estructura de carpetas está organizada por módulos (o contextos) para promover una alta cohesión y un bajo acoplamiento entre funcionalidades.

```
src/
│   expressServer.ts        # Implementación del servidor con Express
│   fastifyServer.ts        # Implementación del servidor con Fastify
│   http.routes.ts          # Agregador de rutas para ambos frameworks
│   main.ts                 # Punto de entrada de la aplicación
│
├───config/                 # Configuración (variables de entorno)
│       envs.ts
│
└───modules/
    ├───auth/               # Módulo de Autenticación
    │   ├───application/
    │   ├───domain/         # (No presente en el ejemplo, pero seguiría la misma estructura)
    │   └───infrastructure/
    │
    ├───shared/             # Código compartido entre módulos
    │   ├───application/
    │   ├───domain/
    │   └───infrastructure/
    │
    └───users/              # Módulo de Usuarios
        ├───application/    # Casos de uso, DTOs y errores de aplicación
        │   ├───dtos/
        │   ├───errors/
        │   └───useCases/
        │
        ├───domain/         # Entidades, interfaces de repositorio y errores de dominio
        │       user.ts
        │       userRepository.ts
        │
        └───infrastructure/ # Controladores, rutas y persistencia de datos
            ├───controllers/
            ├───repositories/
            └───routes/
```

## 🚀 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

-   Node.js (v18 o superior)
-   npm o pnpm

### 1. Clonar el Repositorio

```bash
git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
cd tu-repositorio
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto, copiando el contenido de `.env.template` o usando la siguiente plantilla:

```env
# Puerto del servidor
PORT=3000

# Clave secreta para firmar los tokens JWT
AUTH_TOKEN_SECRET_KEY=YOUR_SUPER_SECRET_KEY

# Ruta para almacenar los archivos subidos de los usuarios
PATH_USER_FILES=public/uploads/users
```

## 🏃‍♂️ Ejecutar la Aplicación

### Modo de Desarrollo

Para ejecutar la aplicación en modo de desarrollo con recarga automática:

```bash
npm run dev
```

### Build de Producción

Para compilar el proyecto para producción:

```bash
npm run build
```

### Iniciar en Producción

Para ejecutar la versión compilada:

```bash
npm run start
```

### 🔄 Cambiar entre Express y Fastify

Este proyecto demuestra cómo la Arquitectura Limpia permite cambiar componentes de infraestructura sin afectar la lógica de negocio. Para cambiar el framework web, simplemente edita el archivo `src/main.ts`:

```typescript
// src/main.ts

// ... (importaciones)

async function main() {
    // ... (creación de carpetas)

    /*
    // --- Para usar Express ---
    const server = new ExpressServer(envs.port);
    server.initializeRoutes(HttpExpressRoutes.routes);
    server.listen();
    */

    // --- Para usar Fastify ---
    const server = new FastifyServer(envs.port);
    await server.initializeRoutes(HttpFastifyRoutes.routes);
    await server.listen();
}
```

Descomenta el bloque del servidor que deseas utilizar y comenta el otro.

## 🛠️ Tecnologías Utilizadas

-   **Frameworks:** Node.js, Express, Fastify
-   **Lenguaje:** TypeScript
-   **Validación:** Zod
-   **Autenticación:** JSON Web Token (JWT), bcryptjs
-   **Manejo de Archivos:** Multer (para Express), @fastify/multipart (para Fastify)
-   **Variables de Entorno:** `dotenv`, `env-var`
-   **Herramientas de Desarrollo:** `ts-node-dev`, `rimraf`, `tsconfig-paths`

## 📝 Pendientes (To-Do)

Este proyecto es una base sólida, pero hay varias áreas para futuras mejoras:

-   [ ] **Mejorar el Manejo de Archivos:** La implementación actual para la subida de archivos con Express (Multer) y Fastify es funcional pero puede robustecerse. Se podría centralizar la lógica de validación y almacenamiento para que sea más agnóstica al framework, moviéndola a una capa más interna.
-   [ ] **Implementar Persistencia en Base de Datos:** Actualmente, la persistencia de datos principal es en memoria (`inMemoryUserRepository`). Aunque existe un archivo `postgresUserRepository.ts`, no está completamente implementado. El siguiente paso es conectar una base de datos como PostgreSQL y desarrollar la lógica de persistencia real.
-   [ ] **Añadir Pruebas Unitarias y de Integración:** Implementar un framework de testing como Jest o Vitest para añadir pruebas a los casos de uso (unitarias) y a los endpoints (integración).
-   [ ] **Implementar un Contenedor de Inyección de Dependencias:** Utilizar una librería como `tsyringe` o `inversify` para gestionar la inyección de dependencias de una forma más automatizada y escalable.
-   [ ] **Documentación de API:** Generar documentación automática de la API utilizando herramientas como Swagger o OpenAPI.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
