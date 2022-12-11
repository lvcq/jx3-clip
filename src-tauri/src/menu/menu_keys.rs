use std::str::FromStr;
use std::str::ParseBoolError;

macro_rules! menu_keys {
    ($($key:ident),*)=>{
        #[derive(Clone,Debug)]
        pub enum MenuKeys{
            $($key,)*
            Undefined
        }
        impl Into<String> for MenuKeys{
            fn into(self) -> String {
                match self{
                    $(MenuKeys::$key=>{
                        stringify!($key).to_string()
                    },
                )*
                MenuKeys::Undefined=> "undefined".to_string()
                }
             }
        }
        impl FromStr for MenuKeys{
            type Err= ParseBoolError;

            fn from_str(s: &str) -> Result<Self, Self::Err>{
                match s{
                    $(stringify!($key)=>{
                        Ok(MenuKeys::$key)
                    })*,
                    _ => Ok(MenuKeys::Undefined)
                }
            }
        }
    }
}

menu_keys!(
    ClipConfig,
    FrameConfig,
    CreateNewProject,
    ClearProjectTmp,
    OpenProject
);
