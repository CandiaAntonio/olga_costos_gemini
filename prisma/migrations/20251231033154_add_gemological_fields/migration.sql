-- AlterTable
ALTER TABLE "PiedraIndividual" ADD COLUMN "certificateImageUrl" TEXT;
ALTER TABLE "PiedraIndividual" ADD COLUMN "pricePerCarat" REAL;

-- CreateTable
CREATE TABLE "CompraMetal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metalType" TEXT NOT NULL,
    "gramsPurchased" REAL NOT NULL,
    "gramsRemaining" REAL NOT NULL,
    "pricePerGramCOP" REAL NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "provider" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoPiedraId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "tipoMovimiento" TEXT NOT NULL,
    "referenciaId" TEXT,
    "notas" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_tipoPiedraId_fkey" FOREIGN KEY ("tipoPiedraId") REFERENCES "TipoPiedra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TipoPiedra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "precioCop" REAL NOT NULL,
    "esNatural" BOOLEAN NOT NULL DEFAULT true,
    "categoria" TEXT,
    "trackingType" TEXT NOT NULL DEFAULT 'LOT',
    "stockActual" INTEGER DEFAULT 0,
    "sizeMm" REAL,
    "shape" TEXT NOT NULL DEFAULT 'Round',
    "color" TEXT,
    "clarity" TEXT,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_TipoPiedra" ("activo", "categoria", "creadoEn", "descripcion", "esNatural", "id", "nombre", "precioCop", "sizeMm", "stockActual", "trackingType") SELECT "activo", "categoria", "creadoEn", "descripcion", "esNatural", "id", "nombre", "precioCop", "sizeMm", "stockActual", "trackingType" FROM "TipoPiedra";
DROP TABLE "TipoPiedra";
ALTER TABLE "new_TipoPiedra" RENAME TO "TipoPiedra";
CREATE UNIQUE INDEX "TipoPiedra_nombre_key" ON "TipoPiedra"("nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StockMovement_tipoPiedraId_idx" ON "StockMovement"("tipoPiedraId");
