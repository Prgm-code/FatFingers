use std::sync::atomic::{AtomicBool, Ordering};

static QUIT_REQUESTED: AtomicBool = AtomicBool::new(false);

pub fn request_quit() {
    QUIT_REQUESTED.store(true, Ordering::SeqCst);
}

pub fn is_quit_requested() -> bool {
    QUIT_REQUESTED.load(Ordering::SeqCst)
}
