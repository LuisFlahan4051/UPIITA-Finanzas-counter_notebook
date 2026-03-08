use rust_xlsxwriter::*;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct MovementLine {
    concepto: String,
    #[serde(rename = "type")]
    account_type: String,
    cargo: serde_json::Value,
    abono: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct Movement {
    #[allow(dead_code)]
    id: i64,
    title: String,
    lines: Vec<MovementLine>,
}

#[derive(Debug, Deserialize)]
struct SumRow {
    movimiento: String,
    concepto: String,
    #[serde(rename = "type")]
    #[allow(dead_code)]
    account_type: String,
    cargo: f64,
    abono: f64,
}

#[derive(Debug, Deserialize)]
struct ConceptSummary {
    #[allow(dead_code)]
    key: String,
    title: String,
    rows: Vec<SumRow>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn export_to_excel(
    movements: Vec<Movement>,
    summaries: Vec<ConceptSummary>,
    file_path: String,
) -> Result<String, String> {
    // Crear nuevo workbook
    let mut workbook = Workbook::new();

    // Crear formatos
    let header_format = Format::new()
        .set_bold()
        .set_background_color(Color::RGB(0x4472C4))
        .set_font_color(Color::White)
        .set_align(FormatAlign::Center);

    let title_format = Format::new()
        .set_bold()
        .set_font_size(14)
        .set_background_color(Color::RGB(0xD9E1F2));

    let number_format = Format::new().set_num_format("#,##0.00");

    // ============ HOJA 1: MOVIMIENTOS ============
    let worksheet_movements = workbook.add_worksheet();
    worksheet_movements
        .set_name("Movimientos")
        .map_err(|e| e.to_string())?;

    // Ajustar anchos de columna
    worksheet_movements
        .set_column_width(0, 35)
        .map_err(|e| e.to_string())?;
    worksheet_movements
        .set_column_width(1, 15)
        .map_err(|e| e.to_string())?;
    worksheet_movements
        .set_column_width(2, 15)
        .map_err(|e| e.to_string())?;
    worksheet_movements
        .set_column_width(3, 15)
        .map_err(|e| e.to_string())?;

    let mut current_row: u32 = 0;

    // Iterar sobre cada movimiento y apilarlos verticalmente
    for movement in movements.iter() {
        // Escribir título del movimiento
        worksheet_movements
            .write_with_format(current_row, 0, &movement.title, &title_format)
            .map_err(|e| e.to_string())?;
        current_row += 1;

        // Escribir encabezados
        worksheet_movements
            .write_with_format(current_row, 0, "Concepto", &header_format)
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_with_format(current_row, 1, "Tipo", &header_format)
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_with_format(current_row, 2, "Cargo", &header_format)
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_with_format(current_row, 3, "Abono", &header_format)
            .map_err(|e| e.to_string())?;
        current_row += 1;

        // Escribir datos
        let data_start_row = current_row;
        for line in movement.lines.iter() {
            worksheet_movements
                .write(current_row, 0, &line.concepto)
                .map_err(|e| e.to_string())?;
            worksheet_movements
                .write(current_row, 1, &line.account_type)
                .map_err(|e| e.to_string())?;

            // Convertir cargo a número
            let cargo_value = match &line.cargo {
                serde_json::Value::Number(n) => n.as_f64().unwrap_or(0.0),
                serde_json::Value::String(s) => s.parse::<f64>().unwrap_or(0.0),
                _ => 0.0,
            };
            worksheet_movements
                .write_with_format(current_row, 2, cargo_value, &number_format)
                .map_err(|e| e.to_string())?;

            // Convertir abono a número
            let abono_value = match &line.abono {
                serde_json::Value::Number(n) => n.as_f64().unwrap_or(0.0),
                serde_json::Value::String(s) => s.parse::<f64>().unwrap_or(0.0),
                _ => 0.0,
            };
            worksheet_movements
                .write_with_format(current_row, 3, abono_value, &number_format)
                .map_err(|e| e.to_string())?;

            current_row += 1;
        }

        // Agregar totales
        current_row += 1;
        worksheet_movements
            .write_with_format(current_row, 0, "TOTALES", &header_format)
            .map_err(|e| e.to_string())?;

        let cargo_formula = format!("=SUM(C{}:C{})", data_start_row + 1, current_row);
        let abono_formula = format!("=SUM(D{}:D{})", data_start_row + 1, current_row);

        worksheet_movements
            .write_formula_with_format(current_row, 2, cargo_formula.as_str(), &number_format)
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_formula_with_format(current_row, 3, abono_formula.as_str(), &number_format)
            .map_err(|e| e.to_string())?;

        // Agregar línea en blanco entre movimientos
        current_row += 2;
    }

    // ============ HOJA 2: SUMAS ============
    let worksheet_sums = workbook.add_worksheet();
    worksheet_sums
        .set_name("Sumas")
        .map_err(|e| e.to_string())?;

    // Ajustar anchos de columna
    worksheet_sums
        .set_column_width(0, 25)
        .map_err(|e| e.to_string())?;
    worksheet_sums
        .set_column_width(1, 35)
        .map_err(|e| e.to_string())?;
    worksheet_sums
        .set_column_width(2, 15)
        .map_err(|e| e.to_string())?;
    worksheet_sums
        .set_column_width(3, 15)
        .map_err(|e| e.to_string())?;

    let mut sum_row: u32 = 0;

    // Iterar sobre cada concepto y apilarlos verticalmente
    for summary in summaries.iter() {
        // Escribir título del concepto
        worksheet_sums
            .write_with_format(sum_row, 0, &summary.title, &title_format)
            .map_err(|e| e.to_string())?;
        sum_row += 1;

        // Escribir encabezados
        worksheet_sums
            .write_with_format(sum_row, 0, "Movimiento", &header_format)
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_with_format(sum_row, 1, "Concepto", &header_format)
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_with_format(sum_row, 2, "Cargo", &header_format)
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_with_format(sum_row, 3, "Abono", &header_format)
            .map_err(|e| e.to_string())?;
        sum_row += 1;

        let sum_data_start = sum_row;

        // Escribir filas de datos
        for row in summary.rows.iter() {
            worksheet_sums
                .write(sum_row, 0, &row.movimiento)
                .map_err(|e| e.to_string())?;
            worksheet_sums
                .write(sum_row, 1, &row.concepto)
                .map_err(|e| e.to_string())?;
            worksheet_sums
                .write_with_format(sum_row, 2, row.cargo, &number_format)
                .map_err(|e| e.to_string())?;
            worksheet_sums
                .write_with_format(sum_row, 3, row.abono, &number_format)
                .map_err(|e| e.to_string())?;
            sum_row += 1;
        }

        // Agregar suma total
        sum_row += 1;
        worksheet_sums
            .write_with_format(sum_row, 0, "Suma", &header_format)
            .map_err(|e| e.to_string())?;

        let sum_cargo_formula = format!("=SUM(C{}:C{})", sum_data_start + 1, sum_row);
        let sum_abono_formula = format!("=SUM(D{}:D{})", sum_data_start + 1, sum_row);

        worksheet_sums
            .write_formula_with_format(sum_row, 2, sum_cargo_formula.as_str(), &number_format)
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_formula_with_format(sum_row, 3, sum_abono_formula.as_str(), &number_format)
            .map_err(|e| e.to_string())?;

        // Calcular saldo
        sum_row += 1;
        worksheet_sums
            .write_with_format(sum_row, 0, "Saldo", &header_format)
            .map_err(|e| e.to_string())?;

        let saldo_formula = format!("=C{}-D{}", sum_row, sum_row);
        worksheet_sums
            .write_formula_with_format(sum_row, 2, saldo_formula.as_str(), &number_format)
            .map_err(|e| e.to_string())?;

        // Línea en blanco entre conceptos
        sum_row += 2;
    }

    // Guardar archivo
    workbook.save(&file_path).map_err(|e| e.to_string())?;

    Ok(format!("Excel generado exitosamente en: {}", file_path))
}

#[tauri::command]
fn write_json_file(content: String, file_path: String) -> Result<String, String> {
    std::fs::write(&file_path, content).map_err(|e| format!("Error al escribir archivo: {}", e))?;
    Ok(format!("JSON guardado exitosamente en: {}", file_path))
}

#[tauri::command]
fn read_json_file(file_path: String) -> Result<String, String> {
    std::fs::read_to_string(&file_path).map_err(|e| format!("Error al leer archivo: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            export_to_excel,
            write_json_file,
            read_json_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
