use sqlite::Connection;
use std::env;
use std::fs;
use std::path::PathBuf;

pub fn get_database_connection() -> Result<Connection, String> {
    let db_path = get_database_path()?;
    match sqlite::open(db_path) {
        Ok(conn) => Ok(conn),
        Err(_) => Err("".to_string()),
    }
}

fn get_database_path()->Result<PathBuf,String>{
    let current_dir = env::current_dir().expect("Get current directory");
    let mut db_dir = current_dir.clone();
    db_dir.push("database");
    if !db_dir.exists(){
        fs::create_dir_all(&db_dir).expect("Create database directory fail.")
    }
    let mut db_path = db_dir.clone();
    db_path.push("jx3.db");
    Ok(db_path)
}