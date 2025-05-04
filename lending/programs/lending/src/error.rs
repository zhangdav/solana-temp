use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("Requested amount exceeds borrowable amount")]
    OverBorrowableAmount,

    #[msg("Attempting to repay more than borrowed.")]
    OverRepay,
}
