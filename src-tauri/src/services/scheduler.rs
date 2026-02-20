use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use tauri::{AppHandle, Emitter};

use crate::services::fullscreen;

struct SchedulerState {
    interval_minutes: u32,
    consecutive_skips: u32,
}

pub struct Scheduler {
    state: Mutex<SchedulerState>,
    running: AtomicBool,
}

impl Scheduler {
    pub fn new(interval_minutes: u32) -> Self {
        Scheduler {
            state: Mutex::new(SchedulerState {
                interval_minutes,
                consecutive_skips: 0,
            }),
            running: AtomicBool::new(false),
        }
    }

    pub fn start(self: &Arc<Self>, app_handle: AppHandle) {
        if self.running.swap(true, Ordering::SeqCst) {
            return; // Already running
        }

        let scheduler = Arc::clone(self);
        let handle = app_handle.clone();

        tokio::spawn(async move {
            loop {
                let interval_minutes = {
                    let state = scheduler.state.lock().unwrap();
                    state.interval_minutes
                };

                tokio::time::sleep(Duration::from_secs(interval_minutes as u64 * 60)).await;

                if !scheduler.running.load(Ordering::SeqCst) {
                    break;
                }

                // Check fullscreen - skip notification if fullscreen app is active
                if fullscreen::is_fullscreen_app_active() {
                    let mut state = scheduler.state.lock().unwrap();
                    state.consecutive_skips += 1;
                    log::info!(
                        "Scheduler: skipped (fullscreen active), consecutive: {}",
                        state.consecutive_skips
                    );

                    if state.consecutive_skips >= 2 {
                        let _ = handle.emit("scheduler:suggest-config", ());
                    }
                    continue;
                }

                // Reset skips and emit cycle complete
                {
                    let mut state = scheduler.state.lock().unwrap();
                    state.consecutive_skips = 0;
                }

                let _ = handle.emit("scheduler:cycle-complete", ());
                log::info!("Scheduler: cycle complete");
            }
        });
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
    }

    pub fn update_interval(&self, minutes: u32) {
        let mut state = self.state.lock().unwrap();
        state.interval_minutes = minutes;
        log::info!("Scheduler interval updated to {} minutes", minutes);
    }

    pub fn record_skip(&self) {
        let mut state = self.state.lock().unwrap();
        state.consecutive_skips += 1;
    }

    pub fn reset_skips(&self) {
        let mut state = self.state.lock().unwrap();
        state.consecutive_skips = 0;
    }
}
