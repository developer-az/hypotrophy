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
  emptyProjection,
  isDomain,
  isPriority,
  type Domain,
  type Priority,
  type Goal,
  type Insight,
  type Projection,
} from './domain/types'
export { fold, apply } from './domain/reducer'
export { migrateLegacyTasks, type LegacyTask } from './domain/migrate'
export { buildGraph, eligibleGoalIds, type GoalGraph, type GraphNode } from './graph/dag'
export { thompsonSelect, mulberry32, type BanditArm } from './quant/bandit'
export { kellyPlan, type KellySlice } from './quant/kelly'
export { kaplanMeier, medianSurvival, survivalAt, type SurvivalCurve } from './quant/survival'
export { allocate, type AllocationPlan, type NextAction } from './quant/allocator'
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
} from './commands'
