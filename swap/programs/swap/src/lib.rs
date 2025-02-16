pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("FoQqCBMAjTAv9xSt2kQFT2YDimeNBrAnGTL5tHskCurx");

#[program]
pub mod swap {
    use super::*;

    pub fn make_offer(context: Context<MakerOffer>) -> Result<()> {
        instructions::make_offer::send_offered_tokens_to_vault()?;
        instructions::make_offer::save_offer()
    }
}
