use sqlite::Connection;

pub fn initialize_frame_config_table(conn: &Connection) -> Result<(), String> {
    let stmt = "CREATE TABLE IF NOT EXISTS FRAME_CONFIG(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME VARCHAR(64) NOT NULL UNIQUE,
        WIDTH INTEGER NOT NULL,
        HEIGHT INTEGER NOT NULL,
        TOP INTEGER NOT NULL,
        RIGHT INTEGER NOT NULL,
        BOTTOM INTEGER NOT NULL,
        LEFT INTEGER NOT NULL,
        SOURCE TEXT,
        CREATE_AT TEXT
    );";
    match conn.execute(stmt) {
        Ok(_) => Ok(()),
        Err(_) => Err("Initialize clip config table fail.".to_string()),
    }
}
