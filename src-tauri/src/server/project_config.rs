use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectConfig {
    pub hair: Option<PartConfig>,
    pub clothes: Option<PartConfig>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PartConfig {
    pub images: Vec<String>,
    pub width:u32,
    pub height:u32,
    pub colgap:u32,
    pub rowgap:u32,
    pub cols:u32,
    pub frame_config: Option<FrameConfig>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FrameConfig {
    pub source: String,
    pub width: u32,
    pub height: u32,
    pub top: u32,
    pub right: u32,
    pub bottom: u32,
    pub left: u32,
}
