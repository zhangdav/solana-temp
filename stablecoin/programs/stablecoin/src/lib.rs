use anchor_lang::prelude::*;

use state::*;
mod state;
use constants::*;
mod constants;
use instructions::*;
mod instructions;
mod error;

declare_id!("8Ae33BgCJ7HYQ9sWmE2C5t5PCW6Y4Nc7rNyMTx6JNQTx");

#[program]
pub mod stablecoin {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        process_initialize_config(ctx)
    }
}