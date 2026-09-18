import * as ExcelJS from 'exceljs';

export const generateExcelFile = async (excelRows: any[], mode: 'download' | 'email' = 'email'): Promise<ExcelJS.Workbook> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pedido");

  let columns = [
    { header: 'Fecha', key: 'Fecha', width: 12 },
    { header: 'CUIT / CUIL', key: 'CUIT', width: 16 },
    { header: 'Razón Social', key: 'Razon Social', width: 25 },
    { header: 'Dirección de Entrega', key: 'Direccion', width: 30 },
    { header: 'Solicitante', key: 'Solicitante', width: 22 },
    { header: 'Email Contacto', key: 'Email Contacto', width: 25 },
    { header: 'Teléfono', key: 'Telefono', width: 16 },
    { header: 'Email Vendedor', key: 'Email Vendedor', width: 25 },
    { header: 'Observaciones', key: 'Observaciones', width: 25 },
    { header: 'Foto', key: 'Foto', width: 12 },
    { header: 'Sku', key: 'Sku', width: 15 },
    { header: 'Modelo', key: 'Modelo', width: 15 },
    { header: 'Marca', key: 'Marca', width: 15 },
    { header: 'Articulo', key: 'Articulo', width: 15 },
    { header: 'Descripcion', key: 'Descripcion', width: 40 },
    { header: 'Codigo Color', key: 'Codigo Color', width: 15 },
    { header: 'Descripcion Color', key: 'Descripcion Color', width: 25 },
    { header: 'Division', key: 'Division', width: 15 },
    { header: 'Genero', key: 'Genero', width: 15 },
    { header: 'Disciplina', key: 'Disciplina', width: 15 },
    { header: 'Driver', key: 'Driver', width: 15 },
    { header: 'Situacion', key: 'Situacion', width: 15 },
    { header: 'Descuento', key: 'Descuento', width: 15 },
    { header: 'Talle', key: 'Talle', width: 10 },
    { header: 'Cantidad', key: 'Cantidad', width: 10 },
    { header: 'Pcio Publico', key: 'Pcio Publico', width: 15 },
    { header: 'Pcio Confidencial', key: 'Pcio Confidencial', width: 15 },
    { header: 'Subtotal', key: 'Subtotal', width: 15 }
  ];

  if (mode === 'download') {
    // Remove columns A through I
    const columnsToRemove = ['Fecha', 'CUIT', 'Razon Social', 'Direccion', 'Solicitante', 'Email Contacto', 'Telefono', 'Email Vendedor', 'Observaciones'];
    columns = columns.filter(col => !columnsToRemove.includes(col.key));
  } else if (mode === 'email') {
    // Leave A through H, remove only Observaciones
    const columnsToRemove = ['Observaciones'];
    columns = columns.filter(col => !columnsToRemove.includes(col.key));
  }

  worksheet.columns = columns;

  // Header styles
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' }
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  const fotoColIndex = worksheet.columns.findIndex(c => c.key === 'Foto');

  for (let i = 0; i < excelRows.length; i++) {
    const row = excelRows[i];
    
    const addedRow = worksheet.addRow({ ...row, Foto: '' });
    
    addedRow.height = 60;
    addedRow.alignment = { vertical: 'middle' };

    addedRow.getCell('Pcio Publico').numFmt = '"$"#,##0';
    addedRow.getCell('Pcio Confidencial').numFmt = '"$"#,##0';
    addedRow.getCell('Subtotal').numFmt = '"$"#,##0';

    if (row.imageUrl) {
      try {
        const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(row.imageUrl)}`;
        let response = await fetch(proxiedUrl);
        
        if (!response.ok) {
          // Fallback to direct fetch
          response = await fetch(row.imageUrl);
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        let ext: 'png' | 'jpeg' | 'gif' = 'jpeg';
        if (blob.type.includes('png')) ext = 'png';
        if (blob.type.includes('gif')) ext = 'gif';
        
        const imageId = workbook.addImage({
          buffer: arrayBuffer,
          extension: ext,
        });
        
        worksheet.addImage(imageId, {
          tl: { col: fotoColIndex >= 0 ? fotoColIndex : 0, row: i + 1 },
          ext: { width: 50, height: 50 } 
        });
      } catch (e) {
        console.error("Error embedding image for SKU", row.Sku, e);
      }
    }
  }

  return workbook;
};
