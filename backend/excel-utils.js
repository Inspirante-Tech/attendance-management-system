const ExcelJS = require("exceljs");

function normalizeCellValue(value) {
  if (value == null) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  if (typeof value === "object") {
    if (typeof value.text === "string") {
      return value.text;
    }

    if (Object.prototype.hasOwnProperty.call(value, "result")) {
      return normalizeCellValue(value.result);
    }

    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("");
    }

    if (typeof value.hyperlink === "string") {
      return value.text || value.hyperlink;
    }
  }

  return value;
}

async function readExcelFile(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return [];
  }

  const headerRow = worksheet.getRow(1);
  const headers = headerRow.values
    .slice(1)
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  if (headers.length === 0) {
    return [];
  }

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const values = row.values.slice(1);
    const rowData = {};
    let hasValue = false;

    headers.forEach((header, index) => {
      const normalizedValue = normalizeCellValue(values[index]);
      if (normalizedValue !== "" && normalizedValue != null) {
        hasValue = true;
      }
      rowData[header] = normalizedValue;
    });

    if (hasValue) {
      rows.push(rowData);
    }
  });

  return rows;
}

async function createExcelFile(filePath, rows) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  if (columns.length > 0) {
    worksheet.columns = columns.map((key) => ({
      header: key,
      key,
      width: Math.max(key.length + 2, 16),
    }));

    rows.forEach((row) => worksheet.addRow(row));
  }

  await workbook.xlsx.writeFile(filePath);
}

module.exports = {
  createExcelFile,
  readExcelFile,
};
