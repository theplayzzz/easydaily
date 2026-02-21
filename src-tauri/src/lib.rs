mod commands;
mod models;
mod services;

use std::sync::{Arc, Mutex};

use tauri::Manager;

use services::idle::IdleDetector;
use services::scheduler::Scheduler;
use services::storage::StorageService;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize storage
    let storage =
        StorageService::new().expect("Failed to initialize storage");

    // Load config to get scheduler interval
    let config = storage
        .load_config()
        .expect("Failed to load initial config");

    let storage = Arc::new(Mutex::new(storage));
    let scheduler = Arc::new(Scheduler::new(config.cycle_interval));
    let idle_detector = Arc::new(IdleDetector::new());

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .max_file_size(5_000_000) // 5MB per file
                .build(),
        )
        .manage(storage)
        .manage(scheduler.clone())
        .manage(idle_detector.clone())
        .setup(move |app| {
            let handle = app.handle().clone();

            // Setup system tray
            services::tray::setup_tray(&handle)
                .expect("Failed to setup system tray");

            // Close-to-hide: intercept window close to hide instead
            let main_window = app
                .get_webview_window("main")
                .expect("Main window not found");

            main_window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let app = handle.clone();
                    if let Some(win) = app.get_webview_window("main") {
                        let _ = win.hide();
                    }
                }
            });

            // Start idle detector
            let setup_handle = app.handle().clone();
            idle_detector.start(setup_handle.clone());

            // Start scheduler
            scheduler.start(setup_handle.clone());

            // Run startup sequence
            services::startup::run_startup_sequence(setup_handle.clone());

            // Register/unregister autostart based on config (non-fatal if it fails)
            if config.autostart {
                if let Err(e) = services::startup::register_autostart() {
                    log::warn!("Failed to register autostart: {}", e);
                }
            } else {
                if let Err(e) = services::startup::unregister_autostart() {
                    log::warn!("Failed to unregister autostart: {}", e);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Notes
            commands::notes::create_note,
            commands::notes::update_note,
            commands::notes::delete_note,
            commands::notes::get_day_data,
            commands::notes::list_days,
            // Config
            commands::config::get_config,
            commands::config::update_config,
            // Tags
            commands::tags::get_tags,
            commands::tags::create_tag,
            commands::tags::update_tag,
            commands::tags::delete_tag,
            // Attachments
            commands::attachments::save_attachment,
            commands::attachments::delete_attachment,
            commands::attachments::get_attachment_path,
            // System
            commands::system::show_window,
            commands::system::hide_window,
            commands::system::get_idle_seconds,
            commands::system::play_notification_sound,
            commands::system::is_fullscreen_app_active,
            commands::system::get_data_path,
            commands::system::get_log_path,
            // AI
            commands::ai::generate_summary,
            commands::ai::get_ai_usage_stats,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
