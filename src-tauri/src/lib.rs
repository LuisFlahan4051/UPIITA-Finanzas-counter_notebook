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
    #[serde(default)]
    subtitle: String,
    #[serde(default)]
    description: String,
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
    #[serde(default = "default_naturaleza_saldo")]
    naturaleza_saldo: String,
    rows: Vec<SumRow>,
}

fn default_naturaleza_saldo() -> String {
    "deudora".to_string()
}

fn with_outer_border(format: &Format, top: bool, bottom: bool, left: bool, right: bool) -> Format {
    let mut bordered = format.clone();
    if top {
        bordered = bordered.set_border_top(FormatBorder::Thin);
    }
    if bottom {
        bordered = bordered.set_border_bottom(FormatBorder::Thin);
    }
    if left {
        bordered = bordered.set_border_left(FormatBorder::Thin);
    }
    if right {
        bordered = bordered.set_border_right(FormatBorder::Thin);
    }
    bordered
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
        .set_background_color(Color::RGB(0xD9E1F2))
        .set_align(FormatAlign::Center);

    let description_format = Format::new().set_align(FormatAlign::Center).set_text_wrap();

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
        // Combinar y centrar título, subtítulo y descripción en las cuatro columnas.
        let title_border_format = with_outer_border(&title_format, true, false, true, true);
        let subtitle_border_format = with_outer_border(&title_format, false, false, true, true);
        let description_border_format =
            with_outer_border(&description_format, false, false, true, true);
        worksheet_movements
            .merge_range(
                current_row,
                0,
                current_row,
                3,
                &movement.title,
                &title_border_format,
            )
            .map_err(|e| e.to_string())?;
        current_row += 1;
        worksheet_movements
            .merge_range(
                current_row,
                0,
                current_row,
                3,
                &movement.subtitle,
                &subtitle_border_format,
            )
            .map_err(|e| e.to_string())?;
        current_row += 1;
        worksheet_movements
            .merge_range(
                current_row,
                0,
                current_row,
                3,
                &movement.description,
                &description_border_format,
            )
            .map_err(|e| e.to_string())?;
        current_row += 1;

        // Escribir encabezados
        worksheet_movements
            .write_with_format(
                current_row,
                0,
                "Concepto",
                &with_outer_border(&header_format, false, false, true, false),
            )
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_with_format(
                current_row,
                1,
                "Tipo",
                &with_outer_border(&header_format, false, false, false, false),
            )
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_with_format(
                current_row,
                2,
                "Cargo",
                &with_outer_border(&header_format, false, false, false, false),
            )
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_with_format(
                current_row,
                3,
                "Abono",
                &with_outer_border(&header_format, false, false, false, true),
            )
            .map_err(|e| e.to_string())?;
        current_row += 1;

        // Escribir datos
        let data_start_row = current_row;
        for line in movement.lines.iter() {
            worksheet_movements
                .write_with_format(
                    current_row,
                    0,
                    &line.concepto,
                    &with_outer_border(&Format::new(), false, false, true, false),
                )
                .map_err(|e| e.to_string())?;
            worksheet_movements
                .write_with_format(current_row, 1, &line.account_type, &Format::new())
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
                .write_with_format(
                    current_row,
                    3,
                    abono_value,
                    &with_outer_border(&number_format, false, false, false, true),
                )
                .map_err(|e| e.to_string())?;

            current_row += 1;
        }

        // Agregar totales
        worksheet_movements
            // TOTALES se imprime en dos celdas combinadas y alineadas a la derecha
            .merge_range(
                current_row,
                0,
                current_row,
                1,
                "TOTALES",
                &with_outer_border(&header_format, false, true, true, false),
            )
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_blank(
                current_row,
                1,
                &with_outer_border(&header_format, false, true, false, false),
            )
            .map_err(|e| e.to_string())?;

        let data_end_row = current_row - 1;
        let cargo_formula = format!("=SUM(C{}:C{})", data_start_row + 1, data_end_row + 1);
        let abono_formula = format!("=SUM(D{}:D{})", data_start_row + 1, data_end_row + 1);

        worksheet_movements
            .write_formula_with_format(
                current_row,
                2,
                cargo_formula.as_str(),
                &with_outer_border(&number_format, false, true, false, false),
            )
            .map_err(|e| e.to_string())?;
        worksheet_movements
            .write_formula_with_format(
                current_row,
                3,
                abono_formula.as_str(),
                &with_outer_border(&number_format, false, true, false, true),
            )
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
        // Escribir título del concepto en las celdas de cuatro columnas y centrarlo
        let summary_title_format = with_outer_border(&title_format, true, false, true, true);
        let summary_header_left = with_outer_border(&header_format, false, false, true, false);
        let summary_header_inner = with_outer_border(&header_format, false, false, false, false);
        let summary_header_right = with_outer_border(&header_format, false, false, false, true);
        worksheet_sums
            .merge_range(
                sum_row,
                0,
                sum_row,
                3,
                &summary.title,
                &summary_title_format,
            )
            .map_err(|e| e.to_string())?;
        sum_row += 1;

        // Escribir encabezados
        worksheet_sums
            .write_with_format(sum_row, 0, "Movimiento", &summary_header_left)
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_with_format(sum_row, 1, "Concepto", &summary_header_inner)
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_with_format(sum_row, 2, "Cargo", &summary_header_inner)
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_with_format(sum_row, 3, "Abono", &summary_header_right)
            .map_err(|e| e.to_string())?;
        sum_row += 1;

        let sum_data_start = sum_row;

        // Escribir filas de datos
        for row in summary.rows.iter() {
            worksheet_sums
                .write_with_format(
                    sum_row,
                    0,
                    &row.movimiento,
                    &with_outer_border(&Format::new(), false, false, true, false),
                )
                .map_err(|e| e.to_string())?;
            worksheet_sums
                .write_with_format(sum_row, 1, &row.concepto, &Format::new())
                .map_err(|e| e.to_string())?;
            worksheet_sums
                .write_with_format(sum_row, 2, row.cargo, &number_format)
                .map_err(|e| e.to_string())?;
            worksheet_sums
                .write_with_format(
                    sum_row,
                    3,
                    row.abono,
                    &with_outer_border(&number_format, false, false, false, true),
                )
                .map_err(|e| e.to_string())?;
            sum_row += 1;
        }

        // Agregar suma total abarcando las dos primeras columnas y alineada a la derecha
        worksheet_sums
            .merge_range(
                sum_row,
                0,
                sum_row,
                1,
                "Suma",
                &with_outer_border(&header_format, false, false, true, false),
            )
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_blank(
                sum_row,
                1,
                &with_outer_border(&header_format, false, false, false, false),
            )
            .map_err(|e| e.to_string())?;

        let sum_data_end = sum_row - 1;
        let sum_cargo_formula =
            format!("=SUM(C{}:C{})", sum_data_start + 1, sum_data_end + 1);
        let sum_abono_formula =
            format!("=SUM(D{}:D{})", sum_data_start + 1, sum_data_end + 1);

        worksheet_sums
            .write_formula_with_format(
                sum_row,
                2,
                sum_cargo_formula.as_str(),
                &with_outer_border(&number_format, false, false, false, false),
            )
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_formula_with_format(
                sum_row,
                3,
                sum_abono_formula.as_str(),
                &with_outer_border(&number_format, false, false, false, true),
            )
            .map_err(|e| e.to_string())?;

        // Calcular saldo abarcando las dos primeras columnas y alineado a la derecha
        sum_row += 1;
        worksheet_sums
            .merge_range(
                sum_row,
                0,
                sum_row,
                1,
                "Saldo",
                &with_outer_border(&header_format, false, true, true, false),
            )
            .map_err(|e| e.to_string())?;
        worksheet_sums
            .write_blank(
                sum_row,
                1,
                &with_outer_border(&header_format, false, true, false, false),
            )
            .map_err(|e| e.to_string())?;

        let saldo_column = if summary.naturaleza_saldo == "deudora" {
            2
        } else {
            3
        };
        let saldo_formula = if summary.naturaleza_saldo == "deudora" {
            format!("=C{}-D{}", sum_row, sum_row)
        } else {
            format!("=D{}-C{}", sum_row, sum_row)
        };
        if saldo_column == 2 {
            worksheet_sums
                .write_formula_with_format(
                    sum_row,
                    2,
                    saldo_formula.as_str(),
                    &with_outer_border(&number_format, false, true, false, false),
                )
                .map_err(|e| e.to_string())?;
            worksheet_sums
                .write_blank(
                    sum_row,
                    3,
                    &with_outer_border(&number_format, false, true, false, true),
                )
                .map_err(|e| e.to_string())?;
        } else {
            worksheet_sums
                .write_blank(
                    sum_row,
                    2,
                    &with_outer_border(&number_format, false, true, false, false),
                )
                .map_err(|e| e.to_string())?;
            worksheet_sums
                .write_formula_with_format(
                    sum_row,
                    3,
                    saldo_formula.as_str(),
                    &with_outer_border(&number_format, false, true, false, true),
                )
                .map_err(|e| e.to_string())?;
        }

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
