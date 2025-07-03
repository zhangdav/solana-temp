use anchor_lang::prelude::*;
use anchor_lang::prelude::Pubkey;
use instructions::*;

mod error;
mod instructions;
mod state;
mod constants;

declare_id!("B8McKr94AXQod2deREAaWgWibTzdxeW1FkhRg3GH651W");

#[program]
pub mod lending {
    use crate::instructions::*;
    use anchor_lang::prelude::*;

}
