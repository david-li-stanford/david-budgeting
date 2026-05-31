import { makeAccountHook } from './useAccounts'
import {
  getCreditAccounts, createCreditAccount, patchCreditAccount, deleteCreditAccount,
} from '../api/client'

export const useCreditAccounts = makeAccountHook(
  getCreditAccounts, createCreditAccount, patchCreditAccount, deleteCreditAccount
)
