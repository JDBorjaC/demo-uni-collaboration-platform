import { z } from "zod"

export const projectStatusValues = ["draft", "pending_review", "published", "rejected", "archived"] as const
export const projectVisibilityValues = ["public", "university_only"] as const
export const roleValues = [
  "student",
  "project_leader",
  "collaborator",
  "moderator",
  "admin",
  "external_expert",
] as const
export const projectRoleValues = ["leader", "manager", "contributor"] as const
export const applicationStatusValues = ["pending", "approved", "rejected", "withdrawn"] as const
export const contributionStatusValues = ["submitted", "approved", "rejected", "withdrawn"] as const

export const contributionTypeValues = ["update", "milestone", "resource", "report"] as const
export const affiliationTypeValues = ["university", "company"] as const

export const onboardingSchema = z.object({
  role: z.enum(roleValues),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).default([]),
  universityAffiliationId: z.string().min(1, "Please select your institution"),
  institutionalEmail: z.string().email("Enter a valid email address"),
})

export const createProjectSchema = z.object({
  title: z.string().min(4, "Title must be at least 4 characters").max(120),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(280),
  description: z.string().min(30, "Description must be at least 30 characters").max(8000),
  objectives: z.string().min(20, "Objectives must be at least 20 characters").max(3000).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Please select a category"),
  universityAffiliationId: z.string().optional().or(z.literal("")),
  collaborationNeeds: z.array(z.string()).default([]),
  visibility: z.enum(projectVisibilityValues).default("public"),
  maxMembers: z.coerce.number().int().min(1).max(50).default(6),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
})

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().min(1),
})

export const applicationSchema = z.object({
  projectId: z.string().min(1),
  message: z.string().min(10, "Tell the project leader why you'd like to join").max(1000),
})

export const contributionSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(4000),
  type: z.enum(contributionTypeValues).default("update"),
  contentUrl: z.string().url().optional().or(z.literal("")),
})

export const reviewDecisionSchema = z.object({
  id: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().max(1000).optional(),
})

export const revertAuditSchema = z.object({
  auditLogId: z.string().min(1, "Audit log ID is required"),
  reason: z.string().min(5, "Please provide a reason for reverting this record").max(500),
})

export const updateContributionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(160).optional(),
  description: z.string().min(10).max(4000).optional(),
  type: z.enum(contributionTypeValues).optional(),
  contentUrl: z.string().url().optional().or(z.literal("")),
})
