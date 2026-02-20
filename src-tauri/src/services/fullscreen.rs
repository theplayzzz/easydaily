use winapi::shared::windef::RECT;
use winapi::um::winuser::{
    GetForegroundWindow, GetSystemMetrics, GetWindowRect, SM_CXSCREEN, SM_CYSCREEN,
};

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

        // On Windows 10, maximized windows extend ~7px beyond the screen on
        // each side (invisible resize borders), so rect.left is typically -7.
        // True fullscreen windows (games, video players, presentations) start
        // at exactly (0,0). We use a threshold of -2 to distinguish the two.
        let is_covering_screen = window_width >= screen_width && window_height >= screen_height;
        let is_true_fullscreen = rect.left >= -1 && rect.top >= -1;

        is_covering_screen && is_true_fullscreen
    }
}
