use anchor_lang::prelude::*;
use instructions::*;

mod instructions;
mod state;

declare_id!("B8McKr94AXQod2deREAaWgWibTzdxeW1FkhRg3GH651W");

#[program]
pub mod lending {
    use super::*;

    pub fn init_bank(ctx: Context<InitBank>, liquidation_threshold: u64, max_ltv: u64) -> Result<()> {
        process_init_bank(ctx, liquidation_threshold, max_ltv)
    }
}
