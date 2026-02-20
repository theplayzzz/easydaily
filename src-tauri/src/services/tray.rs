use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

pub fn setup_tray(app: &AppHandle) -> Result<(), String> {
    let add_note = MenuItemBuilder::with_id("add_note", "Adicionar Nota")
        .build(app)
        .map_err(|e| format!("Failed to build menu item: {}", e))?;
    let open_app = MenuItemBuilder::with_id("open_app", "Abrir EasyDaily")
        .build(app)
        .map_err(|e| format!("Failed to build menu item: {}", e))?;
    let generate_summary = MenuItemBuilder::with_id("generate_summary", "Gerar Resumo de Hoje")
        .build(app)
        .map_err(|e| format!("Failed to build menu item: {}", e))?;
    let configure_timer = MenuItemBuilder::with_id("configure_timer", "Configurar Timer")
        .build(app)
        .map_err(|e| format!("Failed to build menu item: {}", e))?;
    let tutorial = MenuItemBuilder::with_id("tutorial", "Tutorial")
        .build(app)
        .map_err(|e| format!("Failed to build menu item: {}", e))?;
    let quit = MenuItemBuilder::with_id("quit", "Sair")
        .build(app)
        .map_err(|e| format!("Failed to build menu item: {}", e))?;

    let menu = MenuBuilder::new(app)
        .item(&add_note)
        .item(&open_app)
        .item(&generate_summary)
        .item(&configure_timer)
        .item(&tutorial)
        .separator()
        .item(&quit)
        .build()
        .map_err(|e| format!("Failed to build menu: {}", e))?;

    let tray = app
        .tray_by_id("main")
        .ok_or("Tray icon not found")?;

    tray.set_menu(Some(menu))
        .map_err(|e| format!("Failed to set tray menu: {}", e))?;

    tray.on_menu_event(move |app, event| {
        match event.id().as_ref() {
            "add_note" => {
                let _ = app.emit("tray:add-note", ());
            }
            "open_app" => {
                show_main_window(app);
            }
            "generate_summary" => {
                show_main_window(app);
                let _ = app.emit("tray:generate-summary", ());
            }
            "configure_timer" => {
                let _ = app.emit("tray:configure-timer", ());
            }
            "tutorial" => {
                let _ = app.emit("tray:tutorial", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        }
    });

    tray.on_tray_icon_event(|tray, event| {
        if let TrayIconEvent::Click {
            button: MouseButton::Left,
            ..
        } = event
        {
            let app = tray.app_handle();
            show_main_window(app);
        }
    });

    log::info!("System tray configured");
    Ok(())
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}
