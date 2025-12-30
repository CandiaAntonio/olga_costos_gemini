-- CreateTable
CREATE TABLE "PiedraIndividual" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoPiedraId" TEXT NOT NULL,
    "codigo" TEXT,
    "certificateNumber" TEXT,
    "carats" REAL,
    "clarity" TEXT,
    "color" TEXT,
    "shape" TEXT,
    "treatment" TEXT,
    "origin" TEXT,
    "costo" REAL NOT NULL,
    "ubicacion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "PiedraIndividual_tipoPiedraId_fkey" FOREIGN KEY ("tipoPiedraId") REFERENCES "TipoPiedra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "open" REAL,
    "high" REAL,
    "low" REAL,
    "close" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PiezaPiedra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "piezaId" TEXT NOT NULL,
    "tipoPiedraId" TEXT NOT NULL,
    "piedraIndividualId" TEXT,
    "cantidad" INTEGER NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT true,
    "tamano" TEXT,
    "limpieza" TEXT,
    "color" TEXT,
    "precioUnitario" REAL NOT NULL,
    "costoTotal" REAL NOT NULL,
    CONSTRAINT "PiezaPiedra_piezaId_fkey" FOREIGN KEY ("piezaId") REFERENCES "Pieza" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PiezaPiedra_tipoPiedraId_fkey" FOREIGN KEY ("tipoPiedraId") REFERENCES "TipoPiedra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PiezaPiedra_piedraIndividualId_fkey" FOREIGN KEY ("piedraIndividualId") REFERENCES "PiedraIndividual" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PiezaPiedra" ("cantidad", "color", "costoTotal", "esPrincipal", "id", "limpieza", "piezaId", "precioUnitario", "tamano", "tipoPiedraId") SELECT "cantidad", "color", "costoTotal", "esPrincipal", "id", "limpieza", "piezaId", "precioUnitario", "tamano", "tipoPiedraId" FROM "PiezaPiedra";
DROP TABLE "PiezaPiedra";
ALTER TABLE "new_PiezaPiedra" RENAME TO "PiezaPiedra";
CREATE UNIQUE INDEX "PiezaPiedra_piedraIndividualId_key" ON "PiezaPiedra"("piedraIndividualId");
CREATE INDEX "PiezaPiedra_piezaId_idx" ON "PiezaPiedra"("piezaId");
CREATE INDEX "PiezaPiedra_tipoPiedraId_idx" ON "PiezaPiedra"("tipoPiedraId");
CREATE TABLE "new_TipoPiedra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "precioCop" REAL NOT NULL,
    "esNatural" BOOLEAN NOT NULL DEFAULT true,
    "categoria" TEXT,
    "trackingType" TEXT NOT NULL DEFAULT 'LOT',
    "stockActual" INTEGER DEFAULT 0,
    "sizeMm" REAL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_TipoPiedra" ("activo", "categoria", "creadoEn", "descripcion", "esNatural", "id", "nombre", "precioCop") SELECT "activo", "categoria", "creadoEn", "descripcion", "esNatural", "id", "nombre", "precioCop" FROM "TipoPiedra";
DROP TABLE "TipoPiedra";
ALTER TABLE "new_TipoPiedra" RENAME TO "TipoPiedra";
CREATE UNIQUE INDEX "TipoPiedra_nombre_key" ON "TipoPiedra"("nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PiedraIndividual_codigo_key" ON "PiedraIndividual"("codigo");

-- CreateIndex
CREATE INDEX "PiedraIndividual_tipoPiedraId_idx" ON "PiedraIndividual"("tipoPiedraId");

-- CreateIndex
CREATE INDEX "MarketPrice_symbol_date_idx" ON "MarketPrice"("symbol", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MarketPrice_symbol_date_key" ON "MarketPrice"("symbol", "date");
