import ExcelJS from 'exceljs';

type ExcelRow = Record<string, unknown>;

function normalizeHeaderValue(value: unknown): string {
    return String(value ?? '').trim();
}

function normalizeCellValue(value: ExcelJS.CellValue): unknown {
    if (value == null) {
        return '';
    }

    if (value instanceof Date) {
        return value.toISOString().split('T')[0];
    }

    if (typeof value === 'object') {
        if ('text' in value && typeof value.text === 'string') {
            return value.text;
        }

        if ('result' in value) {
            return normalizeCellValue(value.result as ExcelJS.CellValue);
        }

        if ('richText' in value && Array.isArray(value.richText)) {
            return value.richText.map((part) => part.text).join('');
        }

        if ('hyperlink' in value && typeof value.hyperlink === 'string') {
            return value.text || value.hyperlink;
        }
    }

    return value;
}

export async function parseExcelBuffer(buffer: Buffer): Promise<ExcelRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        return [];
    }

    const headerRow = worksheet.getRow(1);
    const headerValues = Array.isArray(headerRow.values) ? headerRow.values : [];
    const headers = headerValues
        .slice(1)
        .map((value) => normalizeHeaderValue(value))
        .filter((value) => value.length > 0);

    if (headers.length === 0) {
        return [];
    }

    const rows: ExcelRow[] = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
            return;
        }

        const values = Array.isArray(row.values) ? row.values.slice(1) : [];
        const rowData: ExcelRow = {};
        let hasValue = false;

        headers.forEach((header, index) => {
            const normalizedValue = normalizeCellValue(values[index] as ExcelJS.CellValue);
            if (normalizedValue !== '' && normalizedValue != null) {
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

export async function createExcelBuffer(sheetName: string, rows: ExcelRow[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    if (columns.length > 0) {
        worksheet.columns = columns.map((key) => ({
            header: key,
            key,
            width: Math.max(key.length + 2, 16)
        }));

        rows.forEach((row) => {
            worksheet.addRow(row);
        });
    }

    const output = await workbook.xlsx.writeBuffer();
    return Buffer.isBuffer(output) ? output : Buffer.from(output);
}