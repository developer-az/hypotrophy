export { canonicalize } from './crypto/canonical'
export { sha256, sha256Hex, hashCanonical } from './crypto/hash'
export {
  merkleRoot,
  merkleRootHex,
  proveInclusion,
  proveInclusionHex,
  verifyInclusion,
  verifyInclusionHex,
  verifyProofPath,
  type MerkleProof,
} from './crypto/merkle'
export {
  appendEntry,
  verifyChain,
  forkIndex,
  GENESIS_PREV,
  type ChainEntry,
  type ChainVerifyResult,
} from './crypto/chain'
export {
  generateIdentity,
  signBytes,
  verifyBytes,
  publicPart,
  type Identity,
  type SignatureAlg,
} from './crypto/identity'
export { issueReceipt, verifyReceipt, type GrowthReceipt } from './crypto/receipt'
export {
  DOMAINS,
  PRIORITY_WEIGHT,
  ACCOUNT_KINDS,
  emptyProjection,
  isDomain,
  isPriority,
  isAccountKind,
  isMoneyKind,
  type Domain,
  type Priority,
  type Goal,
  type Insight,
  type Projection,
  type Account,
  type AccountKind,
  type Skill,
  type MoneyPost,
  type MoneyKind,
  type Intel,
} from './domain/types'
export { fold, apply } from './domain/reducer'
export { migrateLegacyTasks, type LegacyTask } from './domain/migrate'
export { buildGraph, eligibleGoalIds, type GoalGraph, type GraphNode } from './graph/dag'
export { thompsonSelect, mulberry32, type BanditArm } from './quant/bandit'
export { kellyPlan, type KellySlice } from './quant/kelly'
export { kaplanMeier, medianSurvival, survivalAt, type SurvivalCurve } from './quant/survival'
export { allocate, type AllocationPlan, type NextAction } from './quant/allocator'
export { hbarOf, priceBook, COMPOUND_BPS, type CapitalBook, type PricedGoal } from './quant/wealth'
export {
  forecast,
  DEFAULT_CAPACITY_MINUTES_PER_DAY,
  type ForwardBook,
  type GoalForecast,
} from './quant/forward'
export { draftMemo, cioPayload, type CioInput } from './quant/memo'
export {
  buildPnl,
  dollarImpact,
  dollarImpactFromNext,
  rateForDomain,
  BILLS_INTEL_ID,
  type PersonalPnl,
} from './quant/pnl'
export { buildDemoLedger, demoScript } from './demo/fixture'
export {
  CommandError,
  genesis,
  createGoal,
  completeGoal,
  abandonGoal,
  deleteGoal,
  linkGoal,
  recordInsight,
  openAccount,
  setAccountBalance,
  postMoney,
  upsertSkill,
  recordIntel,
} from './commands'
