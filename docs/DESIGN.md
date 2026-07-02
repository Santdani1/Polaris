# DESIGN.md — Sistema de diseño de POLARIS

Referencia visual: **Attio / Linear / GoHighLevel bien hecho**. Denso en información, rápido, dark mode, cero apariencia de "proyecto interno". Este documento es la fuente de verdad visual; los tokens viven en `apps/web/app/globals.css` (Tailwind v4 `@theme`).

## Tokens de color (dark mode default)

| Token | Valor | Uso |
|---|---|---|
| `background` | `#0A0A0B` | Fondo de la app |
| `surface` | `#141417` | Cards, sidebar, contenedores |
| `elevated` | `#1C1C21` | Superficie elevada: inputs, hovers, dropdowns, cards anidadas |
| `border` | `#26262B` | Todos los bordes (1px) |
| `foreground` | `#FAFAFA` | Texto primario |
| `muted` | `#A1A1AA` | Texto secundario, labels, metadata |
| `accent` | `#6366F1` | Acciones primarias, indicadores de marca (indigo) |
| `accent-hover` | `#818CF8` | Hover del acento; también texto de acento sobre fondos oscuros |
| `success` | `#22C55E` | Cierres, outcomes positivos, scores altos |
| `warning` | `#F59E0B` | Follow-ups calientes, scores medios, pendientes |
| `danger` | `#EF4444` | Pérdidas, no-shows, opt-outs, errores |

En clases Tailwind: `bg-background`, `bg-surface`, `bg-elevated`, `border-border`, `text-foreground`, `text-muted`, `bg-accent`, `text-accent-hover`, `text-success`, `text-warning`, `text-danger`.

## Tipografía

- **Geist Sans** para toda la UI (`font-sans`).
- **Geist Mono** para datos y números: scores, contadores, montos, ids, timestamps en feeds (`font-mono` + `tabular-nums`).
- Escala (mapeada a `text-xs`…`text-xl`):
  - `text-xs` 11px — metadata, badges, labels de tabla
  - `text-sm` **13px** — celdas de tabla y datos densos
  - `text-base` **14px** — UI general (default del body)
  - `text-lg` 16px — títulos de sección/empty states
  - `text-xl` **20px semibold** — títulos de página (`PageHeader`)

## Densidad y forma

- Tipo Attio/Linear: **compacto e information-rich**. Spacing base 4px (escala default de Tailwind; preferir `gap-2/3`, `p-2.5/3/4`).
- **Radios 8px** (`rounded-lg`) en cards, inputs y botones; `rounded-md` (6px) en badges.
- **Borders de 1px en lugar de sombras.** Nada de `shadow-*`; la jerarquía se construye con `surface` → `elevated` y bordes.
- Alturas compactas: botones e inputs 32px (`h-8`), filas de tabla ~36px.

## Componentes

- Base shadcn/ui **personalizada con estos tokens** — nunca los estilos default. Los componentes viven en `apps/web/components/ui/`.
- **Estados vacíos siempre diseñados** (`EmptyState`): ícono + título + descripción + CTA. Nunca un div vacío. La descripción explica qué vivirá ahí y en qué fase llega.
- Íconos: **lucide-react**, tamaño 16px (`size-4`) en UI, 24px en empty states.
- Badges de subagente: monospace + color propio por subagente (ver `/command`).

## Copy de UI

- **Español mexicano natural**, profesional-cálido, cero corporativo acartonado. ("¿Cómo te fue con…?", "Sin broncas", con moderación.)
- Nombres de código en inglés; todo lo que ve el usuario en español.
- Los números siempre en `font-mono` con `tabular-nums`.
