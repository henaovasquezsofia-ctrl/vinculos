# Vínculos · Herramientas para momentos difíciles

Sitio estático (HTML, CSS y JavaScript puro, sin dependencias) con guías y ejercicios de primeros auxilios emocionales
para quien atraviesa una crisis y para quien la acompaña. **No ofrece atención psicológica, citas ni chat**: orienta,
sostiene y conecta con las líneas de ayuda de Colombia.

## Archivos

```
├── index.html   # Estructura, contenido e ilustración SVG original
├── styles.css   # Paleta pastel rosada, animaciones, alto contraste, impresión
├── script.js    # Interactividad y accesibilidad
└── README.md
```

## Cómo usarlo

1. Deja los cuatro archivos en la misma carpeta.
2. Abre `index.html` en el navegador (no necesita servidor).
3. Para publicarlo, súbelo a un hosting estático (Netlify, GitHub Pages, Vercel).

## Secciones e interacciones

| Sección | Qué hace |
|---|---|
| Header | Botón de emergencia con ventana de llamadas rápidas (123, 192 op. 4, 106) |
| Inicio | Ilustración SVG animada y dos caminos: «estoy mal» / «quiero ayudar» |
| ¿Qué necesito ahora? | Orientación de 4 preguntas que dirige a la ayuda adecuada (nada se guarda) |
| Para mí | Selector de estado de ánimo + respiración guiada, anclaje 5-4-3-2-1, relajación del cuerpo, frases de contención y plan de seguridad (se guarda solo en el navegador; se puede imprimir o guardar como PDF) |
| Para acompañar | Lista de pasos con progreso, tarjetas giratorias «qué decir / qué evitar», frases para copiar, señales de alerta, impresión a PDF |
| Líneas de ayuda | 123, 192 op. 4, 106, 141 y 155 con botones de llamar y copiar |
| Accesibilidad | Tamaño de letra, alto contraste, lectura por voz, menos movimiento, navegación por teclado |

## Líneas verificadas (octubre de 2026)

- **123**: línea de emergencias; atiende también urgencias de salud mental.
- **192, opción 4**: orientación nacional en salud mental del Ministerio de Salud.
- **106**: línea de escucha disponible en Bogotá, Medellín y Cali (no se confirmó como línea nacional).
- **141**: ICBF, protección de niñez y adolescencia.
- **155**: orientación a mujeres víctimas de violencia.

> Las fuentes consultadas son oficiales y de prensa; algunas informaciones sobre la 192 son de 2020-2021 y
> otras más recientes la mantienen vigente. Antes de publicar, confirma cada número en el sitio de la entidad
> (Ministerio de Salud, Secretaría Distrital de Salud de Bogotá, ICBF, Consejería para la Equidad de la Mujer)
> y añade líneas de tu departamento si aplica.

## Ilustraciones

Las ilustraciones son **SVG originales** hechas en código (manos sosteniendo un corazón, nubes y estrellas) y símbolos
Unicode/emoji. No se generaron imágenes con un modelo de IA. Para usar arte propio, reemplaza el bloque `<svg>` dentro
de `.hero-art` en `index.html` por tu `<img src="...">`.

## Consideraciones éticas

- No se recopilan datos personales; el plan de seguridad y las preferencias viven en `localStorage`.
- El lenguaje evita etiquetar o patologizar. Mantén ese criterio al editar los textos.
- Las herramientas de autocuidado **no sustituyen** atención profesional. Haz que un profesional de salud mental revise
  los contenidos antes de publicarlos.
- No añadas ejercicios que usen dolor o sensaciones extremas como «sustituto» de autolesión.
