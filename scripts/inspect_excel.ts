import * as XLSX from "xlsx";
import * as path from "path";

async function main() {
  const excelPath = path.join(process.cwd(), "costos_olga.xlsx");
  console.log(`Reading from: ${excelPath}`);

  try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = "Costo Directos";
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      console.error(
        `Sheet '${sheetName}' not found. Available sheets: ${workbook.SheetNames.join(
          ", "
        )}`
      );
      return;
    }

    const rows = [];
    let row = 2;
    while (true) {
      const cellName = sheet[`U${row}`];
      const cellPrice = sheet[`V${row}`];

      if (!cellName || !cellName.v) break;

      const nombre = cellName.v.toString().trim();
      let precio = 0;
      if (cellPrice && cellPrice.v) {
        if (typeof cellPrice.v === "number") {
          precio = cellPrice.v;
        } else {
          const cleanString = cellPrice.v.toString().replace(/[^0-9.]/g, "");
          precio = parseFloat(cleanString);
        }
      }

      // Only add if reasonable
      if (nombre) {
        rows.push({ row, nombre, precio });
      }
      row++;
    }

    console.log(`Found ${rows.length} entries in columns U/V:`);
    rows.forEach((r) => console.log(`${r.row}: ${r.nombre} - ${r.precio}`));
  } catch (error) {
    console.error("Error reading excel:", error);
  }
}

main();
