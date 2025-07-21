use anchor_lang::prelude::*;

use state::*;
mod state;
use constants::*;
mod constants;
use instructions::*;
mod error;
mod instructions;

declare_id!("8Ae33BgCJ7HYQ9sWmE2C5t5PCW6Y4Nc7rNyMTx6JNQTx");

#[program]
pub mod stablecoin {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        process_initialize_config(ctx)
    }

    pub fn update_config(ctx: Context<UpdateConfig>, min_health_factor: u64) -> Result<()> {
        process_update_config(ctx, min_health_factor)
    }
}
