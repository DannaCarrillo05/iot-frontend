import { relations, sql } from "drizzle-orm"
import {
	bigint,
	bigserial,
	boolean,
	check,
	doublePrecision,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core"

export const valueTypeEnum = ["number", "string", "boolean"] as const
export type ValueType = (typeof valueTypeEnum)[number]

export const devices = pgTable("devices", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.primaryKey(),
	externalId: text("external_id").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const ingestEvents = pgTable(
	"ingest_events",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		ingestId: uuid("ingest_id").notNull().unique(),
		deviceId: uuid("device_id")
			.notNull()
			.references(() => devices.id, { onDelete: "cascade" }),
		receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
		payload: jsonb("payload").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("idx_ingest_events_device_received_at").on(
			table.deviceId,
			table.receivedAt.desc(),
		),
	],
)

export const units = pgTable("units", {
	id: bigserial("id", { mode: "number" }).primaryKey(),
	code: text("code").notNull().unique(),
	displayName: text("display_name").notNull(),
	symbol: text("symbol").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const measurementDefinitions = pgTable(
	"measurement_definitions",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		metricKey: text("metric_key").notNull().unique(),
		displayName: text("display_name").notNull(),
		valueType: text("value_type").$type<ValueType>().notNull(),
		canonicalUnitId: bigint("canonical_unit_id", { mode: "number" }).references(
			() => units.id,
		),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		check(
			"measurement_definitions_value_type_check",
			sql`${table.valueType} in ('number', 'string', 'boolean')`,
		),
	],
)

export const measurements = pgTable(
	"measurements",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		eventId: bigint("event_id", { mode: "number" })
			.notNull()
			.references(() => ingestEvents.id, { onDelete: "cascade" }),
		definitionId: bigint("definition_id", { mode: "number" })
			.notNull()
			.references(() => measurementDefinitions.id),
		valueType: text("value_type").$type<ValueType>().notNull(),
		valueNumber: doublePrecision("value_number"),
		valueText: text("value_text"),
		valueBool: boolean("value_bool"),
		unitId: bigint("unit_id", { mode: "number" }).references(() => units.id),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		check(
			"measurements_value_type_check",
			sql`${table.valueType} in ('number', 'string', 'boolean')`,
		),
		check(
			"measurements_value_check",
			sql`((${table.valueNumber} is not null)::int + (${table.valueText} is not null)::int + (${table.valueBool} is not null)::int) = 1`,
		),
		index("idx_measurements_event_id").on(table.eventId),
		index("idx_measurements_definition_id").on(table.definitionId),
	],
)

export const devicesRelations = relations(devices, ({ many }) => ({
	ingestEvents: many(ingestEvents),
}))

export const ingestEventsRelations = relations(ingestEvents, ({ one, many }) => ({
	device: one(devices, {
		fields: [ingestEvents.deviceId],
		references: [devices.id],
	}),
	measurements: many(measurements),
}))

export const unitsRelations = relations(units, ({ many }) => ({
	measurementDefinitions: many(measurementDefinitions),
	measurements: many(measurements),
}))

export const measurementDefinitionsRelations = relations(
	measurementDefinitions,
	({ one, many }) => ({
		canonicalUnit: one(units, {
			fields: [measurementDefinitions.canonicalUnitId],
			references: [units.id],
		}),
		measurements: many(measurements),
	}),
)

export const measurementsRelations = relations(measurements, ({ one }) => ({
	event: one(ingestEvents, {
		fields: [measurements.eventId],
		references: [ingestEvents.id],
	}),
	definition: one(measurementDefinitions, {
		fields: [measurements.definitionId],
		references: [measurementDefinitions.id],
	}),
	unit: one(units, {
		fields: [measurements.unitId],
		references: [units.id],
	}),
}))

export const user = pgTable("user", {
	id: uuid("id")
		.default(sql`pg_catalog.gen_random_uuid()`)
		.primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text("role"),
	banned: boolean("banned").default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
})

export const session = pgTable(
	"session",
	{
		id: uuid("id")
			.default(sql`pg_catalog.gen_random_uuid()`)
			.primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		impersonatedBy: text("impersonated_by"),
		activeOrganizationId: text("active_organization_id"),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
)

export const account = pgTable(
	"account",
	{
		id: uuid("id")
			.default(sql`pg_catalog.gen_random_uuid()`)
			.primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
)

export const verification = pgTable(
	"verification",
	{
		id: uuid("id")
			.default(sql`pg_catalog.gen_random_uuid()`)
			.primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
)

export const organization = pgTable(
	"organization",
	{
		id: uuid("id")
			.default(sql`pg_catalog.gen_random_uuid()`)
			.primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		logo: text("logo"),
		createdAt: timestamp("created_at").notNull(),
		metadata: text("metadata"),
	},
	(table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
)

export const member = pgTable(
	"member",
	{
		id: uuid("id")
			.default(sql`pg_catalog.gen_random_uuid()`)
			.primaryKey(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").default("member").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	(table) => [
		index("member_organizationId_idx").on(table.organizationId),
		index("member_userId_idx").on(table.userId),
	],
)

export const invitation = pgTable(
	"invitation",
	{
		id: uuid("id")
			.default(sql`pg_catalog.gen_random_uuid()`)
			.primaryKey(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		role: text("role"),
		status: text("status").default("pending").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		inviterId: uuid("inviter_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("invitation_organizationId_idx").on(table.organizationId),
		index("invitation_email_idx").on(table.email),
	],
)

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	members: many(member),
	invitations: many(invitation),
}))

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}))

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}))

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member),
	invitations: many(invitation),
}))

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id],
	}),
}))
