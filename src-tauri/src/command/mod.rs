pub mod config_cmd;
pub mod frame_config_cmd;

pub use config_cmd::{
    __cmd__create_clip_config, __cmd__delete_clip_config, __cmd__get_all_clip_config,
    __cmd__get_clip_config_detail, __cmd__update_clip_config, create_clip_config,
    delete_clip_config, get_all_clip_config, get_clip_config_detail, update_clip_config,
};

pub use frame_config_cmd::{
    __cmd__create_frame_config, __cmd__delete_frame_config, __cmd__get_all_frame_config,
    __cmd__get_frame_config_detail, __cmd__update_frame_config, create_frame_config,
    delete_frame_config, get_all_frame_config, get_frame_config_detail, update_frame_config,
};
