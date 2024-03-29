use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectConfig {
    pub hair: Option<PartConfig>,
    pub clothes: Option<PartConfig>,
    pub central: Option<CentralConfig>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CentralConfig{
   pub v_padding: u32
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PartConfig {
    pub images: Vec<String>,
    pub width: u32,
    pub height: u32,
    pub colgap: u32,
    pub rowgap: u32,
    pub cols: u32,
    pub center: bool,
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectDetail {
    pub name: String,
    pub config: ProjectConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectBrief {
    pub name: String,
    pub path: String,
}
