use crate::{storage, types::TimeLockTip};
use soroban_sdk::{Env, String, Vec};

pub fn get_tipper_tips(env: &Env, tipper: &soroban_sdk::Address) -> Vec<String> {
    storage::get_tipper_tips(env, tipper.clone())
}

pub fn get_tipper_tip_details(env: &Env, tipper: &soroban_sdk::Address) -> Vec<TimeLockTip> {
    let tip_ids = storage::get_tipper_tips(env, tipper.clone());
    let mut tips = Vec::new(env);
    for lock_id in tip_ids.iter() {
        if let Some(tip) = storage::get_tip(env, lock_id) {
            tips.push_back(tip);
        }
    }
    tips
}

pub fn get_refundable_locks(env: &Env) -> Vec<TimeLockTip> {
    let current_time = env.ledger().timestamp();
    let refund_delay = crate::types::REFUND_DELAY_SECS;
    let refund_window = current_time.saturating_sub(refund_delay);

    let all_tips = storage::get_all_tips(env);
    let mut refundable = Vec::new(env);
    for tip in all_tips.iter() {
        if tip.unlock_time <= refund_window {
            refundable.push_back(tip);
        }
    }
    refundable
}