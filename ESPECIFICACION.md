# Protocolab — Especificación del Proyecto

Actúa como un Ingeniero de Software Full-Stack Sénior experto en Node.js, TypeScript, React y maquetación CSS milimétrica para sistemas de impresión. Tu objetivo es escribir el código completo, limpio y funcional para una Aplicación Web independiente (Single-Page Application con su servidor API) que automatice la maquetación e impresión asistida de Libros de Protocolo Notarial en El Salvador.

La aplicación debe integrar todas las normativas de la Sección de Notariado de la Corte Suprema de Justicia (CSJ) de El Salvador explicadas a continuación.

---

## 📐 Parámetros técnicos y reglas de negocio (El Salvador)

1. **Dimensiones del papel:** 21.0 cm de ancho por 28.0 cm de alto.
2. **Capacidad por cara:** Exactamente 24 líneas en el Frente y 24 líneas en el Vuelto (48 líneas por folio).
3. **Interlineado estándar:** Configuración de párrafo estricta en "Exacto a 24 puntos" (line-height) para forzar el encaje de la fuente sobre los renglones físicos.
4. **Tipo y tamaño de fuente por defecto:** Arial, 12pt (configurable por el usuario).
5. **Inversión de márgenes según la cara (costura del libro):**
   - **FRENTE:** Superior 4.46 cm | Inferior 2.46 cm | Izquierdo 3.0 cm | Derecho 1.1 cm
   - **VUELTO:** Superior 2.80 cm | Inferior 4.46 cm | Izquierdo 1.3 cm | Derecho 3.1 cm

## 🔤 Reglas de procesamiento de texto (backend notarial)

El Backend debe procesar el texto legal crudo mediante algoritmos o funciones auxiliares para:

- **Conversión completa a letras:** Reemplazar de forma automática números independientes, fechas, horas, montos económicos (añadiendo la coletilla "dólares de los Estados Unidos de América"), tasas de interés, porcentajes y cadenas numéricas de documentos de identidad (DUI/NIT/Pasaportes) a su lectura literal legal en español de corrido.
- **Relleno de espacios blancos:** Insertar guiones continuos (`----------`) al final de cada párrafo para bloquear la alteración de líneas.
- **Control de flujo y firmas:** Generar texto corrido, justificado, sin negritas ni viñetas. Si el texto termina exactamente en la línea 24 del frente, el cierre "Paso ante mí" y las firmas deben desplazarse de manera automática al bloque del vuelto.

---

## 💻 Requisitos de arquitectura del software

### 1. Backend (Node.js + TypeScript + Express)

- Estructura un servidor API sencillo con un endpoint `POST /api/format-protocol`.
- El endpoint debe recibir el texto legal en bruto y las opciones del usuario:
  - `lineaInicio`: número de línea donde arranca el texto en la primera página.
  - `tamanoFuente`: ej. `"11pt"`, `"12pt"`.
  - `tipoFuente`: ej. `"Arial"`, `"Courier New"`.
  - `ladoInicial`: `"frente"` o `"vuelto"`.
  - `modoSalida`: `"vista-previa"`, `"pagina-por-pagina"`, `"documento-completo"`, `"solo-frentes"`, `"solo-vueltos"`.
- Debe retornar un array de objetos representando cada cara procesada:
  `pages: Array<{ id: number, folioNum: number, type: 'frente' | 'vuelto', content: string }>`.
  Las líneas previas a `lineaInicio` en la primera página deben renderizarse vacías.

### 2. Frontend (React + TypeScript)

- Interfaz de usuario limpia, dividida en dos paneles principales:
  - **Panel izquierdo (formulario de ajustes):** Campos select/input para configurar las 5 variables de entrada y un `textarea` grande para pegar el texto legal en bruto. Un botón prominente de "Procesar y Formatear".
  - **Panel derecho (área de trabajo y vista previa):** Un visor dinámico que simule visualmente las hojas de protocolo. Cada página/cara debe ser un contenedor con las dimensiones exactas (21.0 x 28.0 cm), aplicando de fondo una cuadrícula simulada de 24 líneas y los márgenes asimétricos correspondientes según sea 'frente' o 'vuelto'.

## ⚠️ Lógica requerida de control de impresión asistida (hoja por hoja)

Cuando el usuario haga clic en el botón "Imprimir", el sistema frontend debe implementar la siguiente lógica interactiva en lugar de disparar una impresión masiva descontrolada:

- Si el usuario seleccionó "Imprimir Documento Completo", el sistema NO debe mandar todo de un solo golpe (para evitar que el vuelto se imprima en una hoja nueva equivocada).
- El sistema debe iterar las páginas una por una y pausar el flujo lanzando una alerta modal o un prompt interactivo en pantalla que diga explícitamente según corresponda:
  - "Introduzca la hoja del lado FRENTE para el Folio [X] en la impresora y presione Continuar."
  - "Introduzca la hoja del lado VUELTO para el Folio [X] en la impresora y presione Continuar."
- Solo cuando el usuario haga clic en "Continuar" en la alerta, el sistema ejecutará la acción de impresión local (`window.print()`) aplicando un estilo CSS dinámico que oculte todas las demás páginas y renderice EXCLUSIVAMENTE la página aprobada en ese turno. Al terminar esa impresión, el ciclo avanza y lanza la alerta para la siguiente cara.

---

## Entregable

Todo el código de forma unificada, estructurada y modular. El Backend debe incluir la lógica de TypeScript para tipar la petición y la respuesta, y las funciones clave de parseo de texto. El Frontend debe incluir el componente React principal con su hoja de estilos CSS inline o en un bloque `<style>` integrado (incluyendo las directivas `@media print`) para garantizar la portabilidad y la maquetación exacta en centímetros/puntos.
