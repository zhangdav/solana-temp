use crate::error::ErrorCode;
use crate::state::{Bank, User};
use anchor_lang::prelude::*;
use anchor_spl::token_interface;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked},
};
use std::f64::consts::E;

#[derive(Accounts)]
pub struct Repay<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [mint.key().as_ref()],
        bump,
    )]
    pub bank: Account<'info, Bank>,

    #[account(
        mut,
        seeds = [b"treasury".as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [signer.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn process_repay(ctx: Context<Repay>, amount: u64) -> Result<()> {
    let user = &mut ctx.accounts.user_account;
    let borrow_value: u64;

    match ctx.accounts.mint.to_account_info().key() {
        key if key == user.usdc_address => {
            borrow_value = user.borrowed_usdc;
        }
        _ => {
            borrow_value = user.borrowed_sol;
        }
    }

    let time_diff = user.last_updated_borrowed - user.last_updated;
    let bank = &mut ctx.accounts.bank;

    bank.total_borrowed =
        (bank.total_borrowed as f64 * E.powf(bank.interest_rate as f64 * time_diff as f64)) as u64;

    let value_per_share = bank.total_borrowed as f64 / bank.total_borrow_shares as f64;

    let user_value = borrow_value / value_per_share as u64;

    if amount > user_value {
        return Err(ErrorCode::OverRepay.into());
    }

    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.bank_token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, transfer_cpi_accounts);

    let decimals = ctx.accounts.mint.decimals;

    token_interface::transfer_checked(cpi_ctx, amount, decimals)?;

    let borrow_ratio = amount.checked_div(bank.total_borrowed).unwrap();
    let user_shares = bank.total_borrow_shares.checked_mul(borrow_ratio).unwrap();

    match ctx.accounts.mint.to_account_info().key() {
        key if key == user.usdc_address => {
            user.borrowed_usdc -= amount;
            user.borrowed_usdc_shares -= user_shares;
        }
        _ => {
            user.borrowed_sol -= amount;
            user.borrowed_sol_shares -= user_shares;
        }
    }

    bank.total_borrowed -= amount;
    bank.total_borrow_shares -= user_shares;

    Ok(())
}
