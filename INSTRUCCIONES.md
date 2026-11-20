# Lista de Reposición — Instrucciones

App web (PWA) para anotar cajas y unidades de reposición. Se aloja en GitHub Pages, guarda todo en el iPhone (LocalStorage) y funciona sin internet después de la primera carga.

## 1. Estructura de carpetas

```
lista-reposicion/
├── index.html              ← pantalla de la app
├── styles.css              ← diseño
├── app.js                  ← lógica (contadores, buscador, borrado, guardado)
├── catalog.js              ← EL CATÁLOGO (acá se agregan/editan/quitan productos)
├── sw.js                   ← Service Worker (modo sin conexión y actualizaciones)
├── manifest.webmanifest    ← datos de instalación de la PWA
├── .nojekyll               ← evita que GitHub Pages procese los archivos
├── INSTRUCCIONES.md        ← este archivo
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png
    └── apple-touch-icon.png
```

Todos los archivos tienen que quedar en la raíz del repositorio, con la carpeta `icons/` al lado de `index.html`.

## 2. Subir el proyecto a GitHub (sin usar terminal)

1. Entrá a github.com e iniciá sesión.
2. Arriba a la derecha: **+ → New repository**.
3. Nombre, por ejemplo: `lista-reposicion`. Dejalo en **Public** (GitHub Pages gratis lo necesita) y tocá **Create repository**.
4. En la página del repositorio vacío tocá **uploading an existing file**.
5. Descomprimí el ZIP en tu computadora y arrastrá **todo el contenido** de la carpeta `lista-reposicion` (los archivos y la carpeta `icons`) a la ventana. No arrastres la carpeta contenedora: tienen que subirse `index.html`, `sw.js`, etc. directamente.
6. Abajo tocá **Commit changes**.

> Si el navegador no te deja subir la carpeta `icons` junto con los archivos, subí primero los archivos sueltos y después, con **Add file → Upload files**, arrastrá la carpeta `icons`.
> El archivo `.nojekyll` es oculto en algunos sistemas; si no aparece al descomprimir, no pasa nada: la app funciona igual sin él.

Alternativa con terminal:

```bash
cd lista-reposicion
git init
git add .
git commit -m "Lista de Reposición"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/lista-reposicion.git
git push -u origin main
```

## 3. Activar GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En **Build and deployment → Source** elegí **Deploy from a branch**.
3. En **Branch** elegí **main** y la carpeta **/ (root)**. Tocá **Save**.
4. Esperá 1–2 minutos y refrescá la página. Arriba aparece la dirección:

   `https://TU_USUARIO.github.io/lista-reposicion/`

Esa es la URL de tu app. (Yo no tuve acceso a tu cuenta de GitHub, así que no pude publicarla por vos.)

## 4. Instalar en el iPhone

1. Abrí la URL en **Safari** (tiene que ser Safari) **con internet**, y dejá que cargue completa una vez.
2. Tocá **Compartir** (cuadrado con flecha) → **Agregar a pantalla de inicio**.
3. Nombre: **Lista de Reposición** → **Agregar**.
4. Probá el modo sin conexión: activá modo avión y abrí la app desde el ícono. Tiene que abrir y funcionar.

### MUY IMPORTANTE: usá un solo modo

En iPhone, **Safari y la app instalada guardan los datos por separado**. Lo que anotes en Safari no aparece en el ícono de la pantalla de inicio, y al revés. Elegí uno (lo recomendable es el ícono instalado) y usá siempre ese. En la pantalla principal, abajo, la app te dice en qué modo está abierta.

## 5. Atajo de Siri

Una PWA no puede registrar comandos de Siri propios. Lo que sí se puede es lo siguiente.

**Opción A — probar primero (la más simple):** con la app ya instalada, decí *"Oye Siri, abrir Reposición"* (el nombre corto del ícono). En muchos iPhone Siri abre las apps web instaladas por su nombre. No te lo puedo garantizar: depende de la versión de iOS. Si funciona, listo, y abre la app instalada con tus datos.

**Opción B — Atajo con tu frase exacta:**

1. Abrí la app **Atajos** → **+** (nuevo atajo).
2. **Agregar acción** → buscá **Abrir URLs** → pegá la URL de tu app.
3. Tocá el nombre arriba y poné exactamente: **abrir lista de reposición**.
4. Listo. Ahora podés decir *"Oye Siri, abrir lista de reposición"*.

**Atención con la opción B:** ese atajo abre la URL **en Safari**, no en el ícono instalado. Como los datos son separados (ver sección 4), te va a mostrar una lista distinta. Si usás la opción B, usá la app **siempre desde Safari** (y no la instales), o usá el ícono y la opción A. No mezcles los dos.

## 6. Actualizar la app

1. En GitHub abrí el archivo que quieras cambiar → ícono del lápiz → editá → **Commit changes**.
2. La próxima vez que abras la app con internet, baja sola la versión nueva y se recarga.
3. **Las cantidades guardadas no se tocan**: las actualizaciones solo reemplazan archivos de la app, no el LocalStorage.

Opcional: si querés limpiar cachés viejos, cambiá el número `VERSION` al principio de `sw.js` (y `APP_VERSION` en `app.js`).

Si tenés mala señal, la app espera hasta 2,5 segundos por la red y después abre con la copia guardada.

## 7. Agregar, editar y eliminar productos

Todo se hace en `catalog.js`. Cada categoría tiene grupos (marca o línea) y cada grupo una lista de productos.

**Agregar un producto:** escribí una línea nueva dentro de la lista del grupo, con coma al final (menos la última):

```js
"Danette Postre Vainilla x2",
```

**Eliminar un producto:** borrá su línea. Si ya tenía cantidades cargadas, esas cantidades no se pierden: aparecen en **Resumen → "Otros"** hasta que las borres.

**Editar el nombre de un producto:** si solo cambiás el texto, la app lo toma como un producto nuevo y las cantidades cargadas del anterior quedan en "Otros". Si querés renombrarlo sin perder cantidades, usá la forma con id fijo, que es el nombre original en minúsculas, sin tildes y con guiones (el signo `+` pasa a `mas`, y cualquier otro símbolo a `-`):

```js
{ n: "Danette Flan Vainilla Doble x2", id: "danette-flan-vainilla-x2" },
```

Si no estás en medio de una lista, no te preocupes por esto: renombrá libremente.

**Agregar un grupo (marca):**

```js
{
  nombre: "MARCA NUEVA",
  productos: [
    "Marca Nueva Producto 1 x2",
    "Marca Nueva Producto 2 500g"
  ]
},
```

**Agregar una categoría:** copiá un bloque entero de categoría y cambiá `id` (único, sin espacios ni tildes), `nombre`, `emoji` y `hue` (color: número de 0 a 360). El orden en pantalla es el orden en el archivo.

Reglas del catálogo: cada sabor y cada presentación es un producto propio, y el `xN` del nombre es el contenido del pack (no las cajas que anotás).

## 8. Cómo funciona el guardado (y sus límites)

- Cada toque en **+** o **−**, cada número tipeado y cada borrado se guarda al instante en el iPhone. Arriba ves **✓ Guardado** con la hora.
- Los datos están **solo en este iPhone**, en este navegador/app. **No hay copia en la nube** y no están a salvo de todo: si borrás los datos del sitio o de Safari (Ajustes → Safari → Borrar historial y datos), se pierde la lista. Según la política de Safari, los datos de un sitio abierto en una pestaña pueden ser borrados si no lo usás por varios días; las apps instaladas en la pantalla de inicio no entran en esa regla.
- La app guarda además una copia de la versión anterior de la lista. Si los datos se dañaran, intenta recuperarla y te avisa.
- Después de borrar una categoría, una lista o un contador, aparece **Deshacer** por unos segundos.
- Si el iPhone no permite guardar (por ejemplo, modo privado), la app lo avisa en rojo.

## 9. Qué se probó

Se probó en un navegador simulado: carga de los 120 productos (y que coinciden con tu lista), contadores de cajas y unidades independientes, teclado, borrado individual / por categoría / de toda la lista, que el catálogo siga intacto, persistencia al reabrir, recuperación de datos dañados y buscador. **No se pudo probar** en un iPhone real ni la instalación de la PWA ni el modo sin conexión: hacé la prueba del modo avión (sección 4) apenas la publiques.
