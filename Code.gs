function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    
    if (action === 'SUBMIT_ORDER' || action === 'SUBMIT_ORDER_V2') {
      var sheetId = data.sheetId;
      var ordersTab = data.ordersTab || "Pedidos";
      var customer = data.customer;
      
      var spreadsheet = SpreadsheetApp.openById(sheetId);
      
      // 1. GUARDAR PEDIDO EN PESTAÑA "PEDIDOS" (Solo V2)
      // La pestaña Pedidos la creamos o usamos si ya existe. (Acá sí asumo que hay permiso para escribir en "Pedidos")
      if (data.sheetRows && data.sheetRows.length > 0) {
        var pSheet = spreadsheet.getSheetByName(ordersTab);
        if (!pSheet) {
          pSheet = spreadsheet.insertSheet(ordersTab);
          pSheet.appendRow([
            "Fecha", "CUIT", "Razón Social", "Dirección", "Solicitante", "Email", 
            "Teléfono", "Vendedor", "Sku", "Modelo", "Marca", "Articulo", "Descripcion", 
            "Codigo Color", "Descripcion Color", "Division", "Genero", "Disciplina", 
            "Driver", "Talle", "Cantidad", "Pcio Publico", "Pcio Confidencial", "Subtotal"
          ]);
          pSheet.getRange(1, 1, 1, 24).setFontWeight("bold").setBackground("#f3f4f6");
        }
        var startRow = pSheet.getLastRow() + 1;
        var range = pSheet.getRange(startRow, 1, data.sheetRows.length, data.sheetRows[0].length);
        range.setValues(data.sheetRows);
      }
      
      // 2. ENVIAR CORREOS
      var emails = [];
      if (customer.emailContacto) {
        emails.push(customer.emailContacto.trim());
      }
      if (customer.emailVendedor) {
        var sellerParts = customer.emailVendedor.split(',');
        for (var i = 0; i < sellerParts.length; i++) {
          var sEmail = sellerParts[i].trim();
          if (sEmail && emails.indexOf(sEmail) === -1) {
            emails.push(sEmail);
          }
        }
      }

      var brandText = (data.brand || (customer && customer.marca) || "").toUpperCase().trim();

      // Reglas de destinatarios obligatorios por marca
      if (brandText === 'FILA') {
        if (emails.indexOf('lcarrillo@grupodass.com.ar') === -1) {
          emails.push('lcarrillo@grupodass.com.ar');
        }
      } else if (brandText === 'UMBRO' || brandText === 'ASICS') {
        if (emails.indexOf('nmartinez@grupodass.com.ar') === -1) {
          emails.push('nmartinez@grupodass.com.ar');
        }
      }

      // Siempre incluir copia a mblanco@grupodass.com.ar
      if (emails.indexOf('mblanco@grupodass.com.ar') === -1) {
        emails.push('mblanco@grupodass.com.ar');
      }
      
      var displayBrand = data.brand || (customer && customer.marca) || "";
      var subject = data.subject || (displayBrand ? ("Pedido " + displayBrand + " - " + customer.razonSocial) : ("Nuevo Pedido Confirmado - " + customer.razonSocial));
      
      var body = "Hola " + customer.solicitante + ",\n\n";
      body += "Tu pedido " + (displayBrand ? ("de la marca " + displayBrand + " ") : "") + "ha sido procesado exitosamente.\n\n";
      body += "Datos del Cliente:\n";
      body += "CUIT: " + customer.cuit + "\n";
      body += "Razón Social: " + customer.razonSocial + "\n";
      if (displayBrand) {
        body += "Marca: " + displayBrand + "\n";
      }
      body += "Dirección: " + customer.direccion + "\n\n";
      if (customer.observaciones) {
        body += "Observaciones: " + customer.observaciones + "\n\n";
      }
      body += "Adjunto encontrarás el detalle de los productos solicitados de " + (displayBrand ? displayBrand : "tu pedido") + " en formato Excel.\n\n";
      body += "¡Gracias por tu compra!";
      
      var options = {};
      if (data.excelAttachment && data.excelAttachment.base64) {
        var blob = Utilities.newBlob(Utilities.base64Decode(data.excelAttachment.base64), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', data.excelAttachment.filename);
        options.attachments = [blob];
      }
      
      MailApp.sendEmail({
        to: emails.join(','),
        subject: subject,
        body: body,
        name: "Recepcion De Pedidos Grupo Dass",
        attachments: options.attachments
      });
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'ignored' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}
