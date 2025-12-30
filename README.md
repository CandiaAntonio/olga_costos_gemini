# Lebedeva Jewelry - Sistema de Costeo

Sistema web de costeo para producción de joyería artesanal. Reemplaza hojas de cálculo Excel con una interfaz moderna y cálculos automatizados.

## Características

- **Costeo por 8 Etapas de Producción**: Diseño, Impresión 3D, Fundición, Preparación Esmaltado, Esmaltado, Acabado, Engaste de Piedras, Pulido
- **Cálculo Automático de PCG**: Precio Costo por Gramo basado en costos fijos y depreciación
- **Gestión de Inventario 2.0**: Ledger de alta precisión con edición en línea, clicks en regiones activas y panel expandible.
- **Tesorería de Metales (FIFO)**: Control de inventario de Oro y Plata con valoración "Mark-to-Market" y lógica First-In-First-Out para el costeo de producción.
- **Logica de Identificación**: Sistema de IDs inteligentes `[TrackingType][Category][Serial]` (ej. LDIA001) sin caracteres especiales.
- **Digital Atelier UI**: Interfaz minimalista con tipografía Cormorant, paleta blanco seda (#FAFAFA) y feedback cromático dinámico.
- **Precios Sugeridos**: Cálculo automático con margen de ganancia e impuestos
- **Descuento Máximo**: Cálculo del descuento máximo sin pérdida
- **División de Ganancias**: Soporte para metal propio vs. metal del padre (50%)

## Tech Stack

| Tecnología     | Uso                            |
| -------------- | ------------------------------ |
| Next.js 14     | Framework React con App Router |
| TypeScript     | Tipado estático                |
| Prisma 5       | ORM para base de datos         |
| SQLite         | Base de datos local            |
| Tailwind CSS 4 | Estilos                        |
| Lucide React   | Iconos                         |

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/CandiaAntonio/olga_costos.git
   cd olga_costos
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

4. **Inicializar base de datos**

   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. **Iniciar servidor de desarrollo**

   ```bash
   npm run dev
   ```

6. **Abrir en navegador**
   ```
   http://localhost:3000
   ```

## Scripts Disponibles

| Comando           | Descripción                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Servidor de desarrollo       |
| `npm run build`   | Build de producción          |
| `npm run start`   | Servidor de producción       |
| `npm run lint`    | Verificar código             |
| `npm run db:seed` | Poblar base de datos inicial |

## Estructura del Proyecto

```
src/
├── app/
│   ├── (dashboard)/          # Páginas principales
│   │   ├── page.tsx          # Dashboard
│   │   ├── piezas/           # Gestión de piezas
│   │   ├── inventario/       # Piedras y esmaltes
│   │   ├── costos-fijos/     # Costos fijos y PCG
│   │   ├── ventas/           # Registro de ventas
│   │   └── configuracion/    # Configuración global
│   ├── globals.css           # Estilos globales
│   └── layout.tsx            # Layout raíz
├── components/
│   ├── layout/               # Sidebar, navegación
│   └── ui/                   # Componentes reutilizables
├── lib/
│   ├── db/                   # Cliente Prisma
│   ├── calculations/         # Lógica de negocio (PCG, precios)
│   └── utils.ts              # Utilidades
└── prisma/
    ├── schema.prisma         # Modelo de datos
    └── seed.ts               # Datos iniciales
```

## Modelo de Datos

```
Pieza
├── codigo (único)
├── tipoJoya (aretes, anillo, collar, brazalete)
├── pesoGramos
├── material (plata/oro)
├── esMetalPropio
├── EtapaCosto[] (8 etapas)
├── PiezaPiedra[] (piedras)
├── costoTotal, precioSugerido, descuentoMaximo
└── Venta

TipoPiedra (15+ tipos)
├── nombre, precioUsd
├── esNatural
└── categoria (preciosa, semipreciosa, sintética)

CostoFijo / Depreciacion
├── Costos mensuales fijos
└── Depreciación de herramientas y oficina
```

## Fórmulas de Cálculo

```
PCG = (Suma Costos Fijos + Depreciaciones) / Gramos Producidos

Costo Total = (Peso × PCG) + Piedras + Esmalte + Etapas

Precio Sugerido = (CostoTotal / (1 - margen)) × (1 + impuesto)

Descuento Máximo = ((Precio - Costo×1.19) / Precio) × 100

Ganancia (metal padre) = (Precio - Costo) × 0.5
```

## Tesorería de Metales (Nuevo)

El módulo de **Tesorería de Metales** introduce un sistema avanzado de control de inventario para metales preciosos (Oro y Plata).

### Características Principales

- **FIFO Engine**: Consumo inteligente de inventario "First-In-First-Out". El sistema utiliza automáticamente los lotes más antiguos primero para garantizar una rotación adecuada y un cálculo preciso del COGS.
- **Mark-to-Market Valuation**: Los "Treasury Tiles" muestran el valor actual del inventario basado en los precios de mercado en tiempo real (o última cotización), permitiendo ver la plusvalía/minusvalía latente.
- **Auditoría de Lotes**: Trazabilidad completa de cada compra de metal, incluyendo proveedor, fecha, precio de compra y saldo restante en gramos.

### Flujo de Trabajo

1. **Registro de Compra**: Se ingresan nuevos lotes de metal (Oro/Plata).
2. **Valoración**: El dashboard actualiza el valor total disponible.
3. **Consumo (Producción)**: Al crear una pieza, el sistema descuenta gramos del lote más antiguo disponible.

## Datos de Migración

El sistema incluye migración automática desde el Excel original:

- 15 tipos de piedras con precios en USD
- 14 costos fijos mensuales
- 2 depreciaciones (herramientas, oficina)
- 8 etapas de producción configuradas

## Licencia

Proyecto privado - Lebedeva Jewelry

## Autor

Desarrollado para Lebedeva Jewelry (https://lebedevajewelry.com/)
