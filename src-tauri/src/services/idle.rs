use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;

use tauri::{AppHandle, Emitter};
use winapi::shared::minwindef::DWORD;
use winapi::um::sysinfoapi::GetTickCount;
use winapi::um::winuser::{GetLastInputInfo, LASTINPUTINFO};

const IDLE_THRESHOLD_SECS: u64 = 60;
const POLL_INTERVAL_SECS: u64 = 30;

pub struct IdleDetector {
    running: AtomicBool,
}

impl IdleDetector {
    pub fn new() -> Self {
        IdleDetector {
            running: AtomicBool::new(false),
        }
    }

    pub fn get_idle_seconds() -> u64 {
        unsafe {
            let mut lii = LASTINPUTINFO {
                cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
                dwTime: 0 as DWORD,
            };
            if GetLastInputInfo(&mut lii) != 0 {
                let current_tick = GetTickCount();
                let idle_ms = current_tick.wrapping_sub(lii.dwTime) as u64;
                idle_ms / 1000
            } else {
                0
            }
        }
    }

    pub fn start(self: &Arc<Self>, app_handle: AppHandle) {
        if self.running.swap(true, Ordering::SeqCst) {
            return; // Already running
        }

        let running = Arc::clone(self);
        let handle = app_handle.clone();

        tokio::spawn(async move {
            let mut was_idle = false;

            while running.running.load(Ordering::SeqCst) {
                tokio::time::sleep(Duration::from_secs(POLL_INTERVAL_SECS)).await;

                let idle_secs = Self::get_idle_seconds();
                let is_idle = idle_secs >= IDLE_THRESHOLD_SECS;

                if is_idle != was_idle {
                    let state = if is_idle { "idle" } else { "active" };
                    let _ = handle.emit("idle:state-changed", serde_json::json!({ "state": state }));
                    log::info!("Idle state changed to: {}", state);
                    was_idle = is_idle;
                }
            }
        });
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
    }
}
