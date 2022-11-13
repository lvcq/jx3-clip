use sqlite::Connection;

pub fn get_database_connection() -> Result<Connection, String> {
    match sqlite::open("./database/jx3.db") {
        Ok(conn) => Ok(conn),
        Err(_) => Err("".to_string()),
    }
}
