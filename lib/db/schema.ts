import { boolean, integer, jsonb, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core"

// ---------- Better Auth tables (verbatim column names) ----------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ---------- App tables ----------

export const universityAffiliations = pgTable("university_affiliations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  type: text("type", { enum: ["university", "company"] })
    .notNull()
    .default("university"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role", {
    enum: ["student", "project_leader", "collaborator", "moderator", "admin", "external_expert"],
  })
    .notNull()
    .default("student"),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  institutionalEmail: text("institutionalEmail"),
  skills: jsonb("skills").$type<string[]>(),
  universityAffiliationId: text("universityAffiliationId").references(() => universityAffiliations.id, {
    onDelete: "set null",
  }),
  verificationStatus: text("verificationStatus", { enum: ["pending", "verified", "rejected"] })
    .notNull()
    .default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  objectives: text("objectives"),
  collaborationNeeds: jsonb("collaborationNeeds").$type<string[]>(),
  leaderId: text("leaderId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("categoryId").references(() => categories.id, { onDelete: "set null" }),
  universityAffiliationId: text("universityAffiliationId").references(() => universityAffiliations.id, {
    onDelete: "set null",
  }),
  status: text("status", {
    enum: ["draft", "pending_review", "published", "rejected", "archived"],
  })
    .notNull()
    .default("draft"),
  visibility: text("visibility", { enum: ["public", "university_only"] })
    .notNull()
    .default("public"),
  maxMembers: integer("maxMembers").notNull().default(6),
  coverImageUrl: text("coverImageUrl"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const projectStatusHistory = pgTable("project_status_history", {
  id: text("id").primaryKey(),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  fromStatus: text("fromStatus"),
  toStatus: text("toStatus").notNull(),
  changedBy: text("changedBy")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  reason: text("reason"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const projectSubscriptions = pgTable(
  "project_subscriptions",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => [unique().on(table.projectId, table.userId)],
)

export const collaborationApplications = pgTable("collaboration_applications", {
  id: text("id").primaryKey(),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  applicantId: text("applicantId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected", "withdrawn"] })
    .notNull()
    .default("pending"),
  reviewedBy: text("reviewedBy").references(() => user.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const projectMembers = pgTable(
  "project_members",
  {
    id: text("id").primaryKey(),
    projectId: text("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleInProject: text("roleInProject", { enum: ["leader", "manager", "contributor"] })
      .notNull()
      .default("contributor"),
    status: text("status", { enum: ["active", "removed"] })
      .notNull()
      .default("active"),
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  },
  (table) => [unique().on(table.projectId, table.userId)],
)

export const contributions = pgTable("contributions", {
  id: text("id").primaryKey(),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  memberId: text("memberId")
    .notNull()
    .references(() => projectMembers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ["update", "milestone", "resource", "report"] })
    .notNull()
    .default("update"),
  contentUrl: text("contentUrl"),
  status: text("status", { enum: ["submitted", "approved", "rejected", "withdrawn"] })
    .notNull()
    .default("submitted"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const contributionApprovals = pgTable("contribution_approvals", {
  id: text("id").primaryKey(),
  contributionId: text("contributionId")
    .notNull()
    .references(() => contributions.id, { onDelete: "cascade" }),
  reviewerId: text("reviewerId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  decision: text("decision", { enum: ["approved", "rejected"] }).notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const moderationReviews = pgTable("moderation_reviews", {
  id: text("id").primaryKey(),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  reviewerId: text("reviewerId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  decision: text("decision", { enum: ["approved", "rejected"] }).notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("isRead").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actorId").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entityType").notNull(),
  entityId: text("entityId").notNull(),
  reason: text("reason"),
  previousData: jsonb("previousData"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
