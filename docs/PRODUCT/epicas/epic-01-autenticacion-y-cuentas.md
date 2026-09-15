# Épica 1 — Autenticación y cuentas de usuario

## Objetivo
Permitir que clientes, mecánicos y administrador accedan al sistema con el rol correspondiente, de forma segura, y que cada quien vea solo lo que le corresponde.

## Roles involucrados
Cliente, Mecánico, Admin.

## Alcance
- Registro e inicio de sesión de clientes (auto-registro).
- Creación de usuarios mecánico/admin por parte del administrador (sin auto-registro para estos roles).
- Inicio de sesión único para los tres roles, redirigiendo cada uno a su vista correspondiente.
- Protección de rutas: un cliente no puede acceder al panel admin; un mecánico solo ve lo suyo.
- Recuperación de contraseña (puede simularse en esta fase, ver `docs/01-requerimientos-y-arquitectura.md` sección 0).

## Fuera de alcance
- Login social (Google, etc.).
- Autenticación de dos factores (2FA).

## Historias de usuario
Ver carpeta [`../historias-usuario/epic-01-autenticacion-y-cuentas/`](../historias-usuario/epic-01-autenticacion-y-cuentas/).
