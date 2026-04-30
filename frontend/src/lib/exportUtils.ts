import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { urbanistNormal, urbanistBold } from './urbanistFont';
interface ExportColumn {
    header: string;
    key: string;
}

/**
 * Export data to Excel (.xlsx)
 */
export function exportToExcel(
    data: Record<string, any>[],
    columns: ExportColumn[],
    fileName: string
) {
    const worksheetData = data.map((row) =>
        columns.reduce((acc, col) => {
            acc[col.header] = row[col.key] ?? '';
            return acc;
        }, {} as Record<string, any>)
    );

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Auto-size columns
    const colWidths = columns.map((col) => {
        const maxLen = Math.max(
            col.header.length,
            ...data.map((row) => String(row[col.key] ?? '').length)
        );
        return { wch: Math.min(maxLen + 4, 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();

    // Set font for all cells to Urbanist
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = { font: { name: 'Urbanist' } };
        }
    }
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * Export data to PDF
 */
export function exportToPDF(
    data: Record<string, any>[],
    columns: ExportColumn[],
    fileName: string,
    title: string
) {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Register Urbanist font
    doc.addFileToVFS('Urbanist-Regular.ttf', urbanistNormal);
    doc.addFont('Urbanist-Regular.ttf', 'Urbanist', 'normal');
    doc.addFileToVFS('Urbanist-Bold.ttf', urbanistBold);
    doc.addFont('Urbanist-Bold.ttf', 'Urbanist', 'bold');

    // Header
    doc.setFillColor(10, 14, 46); // #0A0E2E
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('Urbanist', 'bold');
    doc.text(title, 14, 14);
    doc.setFontSize(9);
    doc.setFont('Urbanist', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    // Table
    const tableHeaders = columns.map((c) => c.header);
    const tableRows = data.map((row) =>
        columns.map((col) => String(row[col.key] ?? ''))
    );

    autoTable(doc, {
        startY: 34,
        head: [tableHeaders],
        body: tableRows,
        styles: {
            fontSize: 8,
            cellPadding: 3,
            font: 'Urbanist',
        },
        headStyles: {
            fillColor: [10, 14, 46],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
        margin: { top: 34 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(
            `Page ${i} of ${pageCount} — RCA Discipline Management System`,
            14,
            doc.internal.pageSize.getHeight() - 8
        );
    }

    doc.save(`${fileName}.pdf`);
}
