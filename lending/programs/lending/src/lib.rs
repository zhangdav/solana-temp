use anchor_lang::prelude::*;

declare_id!("B8McKr94AXQod2deREAaWgWibTzdxeW1FkhRg3GH651W");

#[program]
pub mod lending {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
