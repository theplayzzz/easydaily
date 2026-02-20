use winapi::um::winuser::{
    GetForegroundWindow, GetSystemMetrics, GetWindowRect, SM_CXSCREEN, SM_CYSCREEN,
};
use winapi::shared::windef::RECT;

pub fn is_fullscreen_app_active() -> bool {
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return false;
        }

        let mut rect: RECT = std::mem::zeroed();
        if GetWindowRect(hwnd, &mut rect) == 0 {
            return false;
        }

        let screen_width = GetSystemMetrics(SM_CXSCREEN);
        let screen_height = GetSystemMetrics(SM_CYSCREEN);

        let window_width = rect.right - rect.left;
        let window_height = rect.bottom - rect.top;

        window_width >= screen_width && window_height >= screen_height
    }
}
