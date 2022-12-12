use std::path::{Path, PathBuf};
use std::{env, fs, io};

use super::datetime;

/// 复制文件到目标文件夹，传入目标文件为相对于当前项目目录的相对路径
pub fn copy_file(target_dir: &str, source: &str) -> Result<PathBuf, String> {
    let mut target = env::current_dir().expect("Path error");
    target.push(target_dir);
    if !target.exists() {
        fs::create_dir_all(&target).expect("Create directory fail.")
    }
    let source_path = Path::new(source);
    target.push(source_path.file_name().unwrap());
    if target.exists() {
        let extension = target.extension().unwrap_or_default();
        let f_name = target.file_stem().unwrap();
        println!("name: {:?}", &f_name);
        let new_file_name = format!("{}-{}", f_name.to_str().unwrap_or(""), datetime::now());
        println!("new file name: {}", new_file_name);
        target = target
            .with_file_name(new_file_name)
            .with_extension(extension);
    }

    fs::copy(source_path, &target).expect("Copy fail.");
    Ok(target)
}

pub fn unzip_file_to_directory(source: &PathBuf, desc: PathBuf) -> Result<(), String> {
    let zip_file = fs::OpenOptions::new().read(true).open(source).unwrap();
    let mut archive = zip::ZipArchive::new(&zip_file).unwrap();
    for index in 0..archive.len() {
        let mut file = archive.by_index(index).unwrap();
        let sub_path = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };
        let mut outpath = desc.clone();
        outpath.push(sub_path.as_os_str());

        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {} comment: {}", index, comment);
            }
        }

        if (*file.name()).ends_with('/') {
            println!("File {} extracted to \"{}\"", index, outpath.display());
            fs::create_dir_all(&outpath).unwrap();
        } else {
            println!(
                "File {} extracted to \"{}\" ({} bytes)",
                index,
                outpath.display(),
                file.size()
            );
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p).unwrap();
                }
            }
            let mut outfile = fs::File::create(&outpath).unwrap();
            io::copy(&mut file, &mut outfile).unwrap();
        }
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).unwrap();
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod file_test {
    use super::copy_file;
    use std::fs;
    use std::path::Path;
    #[test]
    fn test_copy_file() {
        let source = Path::new("test_dir/123.txt");
        if !source.exists() {
            fs::File::create(&source).unwrap();
            fs::write(&source, "test content").unwrap();
        }
        match copy_file("test_dir/targets/", "test_dir/123.txt") {
            Ok(t_path) => {
                assert!(t_path.is_file());
            }
            Err(_) => {
                assert!(false)
            }
        }
    }
}
