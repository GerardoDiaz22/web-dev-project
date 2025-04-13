import * as XLSX from 'xlsx';

/**
 * Genera y descarga un archivo Excel a partir de un array de objetos.
 *
 * @param {Array<Object>} data - El array de objetos a exportar.
 * @param {Object} columnMapping - Un objeto que mapea las claves de los datos a las cabeceras deseadas en Excel.
 *                                 Ej: { 'ID Usuario': 'userId', 'Nombre Completo': 'name', 'Correo': 'email' }
 * @param {string} fileName - El nombre base para el archivo Excel (sin extensión .xlsx).
 * @param {string} sheetName - El nombre para la hoja dentro del archivo Excel.
 * @returns {boolean} - Devuelve true si la exportación fue exitosa (o al menos iniciada), false si hubo un error o no hay datos.
 */
export function generateExcelReport(data, columnMapping, fileName = 'reporte', sheetName = 'Datos') {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('No hay datos para exportar o el formato es incorrecto.');
    return false; 
  }

  if (!columnMapping || typeof columnMapping !== 'object' || Object.keys(columnMapping).length === 0) {
      console.error('Se requiere un mapeo de columnas válido.');
      return false;
  }

  try {
    // 1. Formatear los datos según el mapeo
    const formattedData = data.map(item => {
      const row = {};
      for (const header in columnMapping) {
        const dataKey = columnMapping[header];
        // Asigna el valor del item usando la clave del mapeo (dataKey)
        // a la nueva clave que será la cabecera de Excel (header)
        // Usamos '?? '' ' para manejar valores undefined o null y poner una cadena vacía
        row[header] = item[dataKey] ?? '';
      }
      return row;
    });

    // 2. Crear la hoja de cálculo a partir de los datos formateados
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // 3. Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();

    // 4. Añadir la hoja de cálculo al libro con el nombre especificado
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 5. Generar el archivo y disparar la descarga
    const finalFileName = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, finalFileName);

    return true; 

  } catch (error) {
    console.error("Error al generar el reporte Excel:", error);
    return false; 
  }
}

