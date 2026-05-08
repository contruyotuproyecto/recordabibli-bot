# RecordaBibli Bot

Bot de Telegram desarrollado con Google Apps Script para enviar recordatorios diarios a un grupo, usando Google Sheets como base de datos simple.

## Objetivo

Automatizar recordatorios diarios según un calendario definido, evitando envíos duplicados y manteniendo la configuración sensible fuera del código fuente.

## Tecnologías usadas

- Telegram Bot API
- Google Apps Script
- Google Sheets
- Triggers programados
- JavaScript

## Funcionalidades

- Envío automático diario de recordatorios.
- Lectura de calendario desde Google Sheets.
- Validación de fecha, nombre y estado activo.
- Control para evitar mensajes duplicados el mismo día.
- Configuración segura mediante propiedades del script.
- Código preparado para uso gratuito sin servidor propio.

## Estructura de Google Sheets

El proyecto usa dos pestañas.

### Calendario

| fecha | nombre | activo |
|---|---|---|
| 2026-05-01 | Persona 1 | SI |
| 2026-05-02 | Persona 2 | SI |

### Enviados

| fecha | nombre | enviado_en |
|---|---|---|

La pestaña `Enviados` registra los mensajes ya enviados para evitar duplicados.

## Variables de configuración

El proyecto usa propiedades del script en Google Apps Script.

| Propiedad | Descripción |
|---|---|
| BOT_TOKEN | Token privado del bot generado en BotFather |
| CHAT_ID | ID del grupo de Telegram |

Estas variables no deben escribirse directamente en el código.

## Seguridad

Este repositorio no incluye:

- Token real del bot.
- Chat ID real.
- Nombre real del grupo.
- Datos personales de participantes.
- Capturas con información sensible.

## Configuración recomendada en BotFather

| Opción | Estado recomendado |
|---|---|
| Group Privacy | Enabled |
| Allow Groups | Disabled después de agregar el bot al grupo correcto |
| Inline Mode | Disabled |
| Business Mode | Disabled |

## Funciones principales

| Función | Descripción |
|---|---|
| crearCalendarioHasta2030 | Genera un calendario base hasta diciembre de 2030 |
| prepararHojaEnviados | Prepara la hoja de control de mensajes enviados |
| enviarRecordatorioDeHoy | Envía el recordatorio correspondiente al día actual |
| probarEnvio | Ejecuta una prueba manual |
| construirMensaje | Construye el texto enviado al grupo |

## Flujo de trabajo

1. El trigger diario ejecuta `enviarRecordatorioDeHoy`.
2. El script obtiene la fecha actual.
3. Busca esa fecha en la hoja `Calendario`.
4. Valida que exista nombre y que el estado sea `SI`.
5. Revisa si ya fue enviado.
6. Envía el mensaje por Telegram.
7. Registra el envío en la hoja `Enviados`.

## Ejemplo de mensaje

```text
📖 Recordatorio bíblico diario

Buenos días, grupo.

Hoy corresponde compartir la Palabra a:

Persona 1

Persona 1, hoy te toca compartir el mensaje bíblico con el grupo.

Puede ser:
• 1 o 2 versículos.
• Una reflexión breve.
• Audio con comentario personal.

Que sea de corazón y para edificación del grupo.
