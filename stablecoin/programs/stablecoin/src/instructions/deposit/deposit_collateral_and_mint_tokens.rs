use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

use crate::{Config, Collateral, SEED_CONFIG_ACCOUNT, SEED_COLLATERAL_ACCOUNT, SEED_SOL_ACCOUNT};

#[derive(Accounts)]
pub struct DepositCollateralAndMintTokens<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(
        seeds = [SEED_CONFIG_ACCOUNT],
        bump = config_account.bump,
        has_one = mint_account,
    )]
    pub config_account: Account<'info, Config>,

    #[account(mut)]
    pub mint_account: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = depositor,
        space = 8 + Collateral::INIT_SPACE,
        seeds = [SEED_COLLATERAL_ACCOUNT, depositor.key().as_ref()],
        bump
    )]
    pub collateral_account: Account<'info, Collateral>,

    #[account(
        mut,
        seeds = [SEED_SOL_ACCOUNT, depositor.key().as_ref()],
        bump
    )]
    pub sol_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}