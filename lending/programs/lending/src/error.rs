use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,

    #[msg("Requested amount exceeds borrowable amount")]
    OverBorrowableAmount,

    #[msg("Requested amount exceeds depositable amount")]
    OverRepay,

    #[msg("User is not under collateralized, can't be liquidated")]
    NotUnderCollateralized,
}
