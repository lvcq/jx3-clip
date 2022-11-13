use sqlite::Connection;

pub fn initialize_clip_config_table(conn: &Connection) -> Result<(), String> {
    let stmt = "CREATE TABLE IF NOT EXISTS CLIP_CONFIG(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        BODY_TYPE INTEGER NOT NULL,
        PART INTEGER NOT NULL,
        NAME VARCHAR(64) NOT NULL UNIQUE,
        TOP INTEGER NOT NULL,
        RIGHT INTEGER NOT NULL,
        BOTTOM INTEGER NOT NULL,
        LEFT INTEGER NOT NULL,
        RADIUS INTEGER NOT NULL,
        THUMBNAIL TEXT,
        CREATE_AT INTEGER
    );";
    match conn.execute(stmt) {
        Ok(_) => Ok(()),
        Err(_) => Err("Initialize clip config table fail.".to_string()),
    }
}
