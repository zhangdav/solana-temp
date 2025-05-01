use anchor_lang::prelude::*;

mod state;
mod instructions;

declare_id!("B8McKr94AXQod2deREAaWgWibTzdxeW1FkhRg3GH651W");

#[program]
pub mod lending {
    use anchor_lang::prelude::*;
    use crate::instructions::admin::InitBank;
    
    pub fn init_bank(_ctx: Context<InitBank>) -> Result<()> {
        Ok(())
    }
}