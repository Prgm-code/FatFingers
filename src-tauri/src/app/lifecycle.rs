use std::ffi::OsStr;
use std::sync::atomic::{AtomicBool, Ordering};

pub const BACKGROUND_ARG: &str = "--background";

static QUIT_REQUESTED: AtomicBool = AtomicBool::new(false);

pub fn requests_background<I, S>(args: I) -> bool
where
    I: IntoIterator<Item = S>,
    S: AsRef<OsStr>,
{
    args.into_iter()
        .any(|arg| arg.as_ref() == OsStr::new(BACKGROUND_ARG))
}

pub fn request_quit() {
    QUIT_REQUESTED.store(true, Ordering::SeqCst);
}

pub fn is_quit_requested() -> bool {
    QUIT_REQUESTED.load(Ordering::SeqCst)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::ffi::OsString;

    #[test]
    fn recognizes_background_launch_argument() {
        let args = [OsString::from("fatfingers"), OsString::from(BACKGROUND_ARG)];

        assert!(requests_background(args));
    }

    #[test]
    fn treats_regular_launch_as_visible() {
        let args = [OsString::from("fatfingers")];

        assert!(!requests_background(args));
    }
}
