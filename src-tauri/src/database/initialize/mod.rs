pub mod clip_config;
pub mod frame_config;
use crate::database::connect;

pub fn initialize_database() -> Result<(), String> {
    let conn = connect::get_database_connection()?;
    clip_config::initialize_clip_config_table(&conn)?;
    frame_config::initialize_frame_config_table(&conn)?;
    Ok(())
}
