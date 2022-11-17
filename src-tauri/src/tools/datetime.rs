use std::time::{SystemTime,UNIX_EPOCH};

pub fn now()->u128{
    let stat = SystemTime::now();
    let since_the_epoch = stat.duration_since(UNIX_EPOCH).expect("");
    since_the_epoch.as_millis()
}