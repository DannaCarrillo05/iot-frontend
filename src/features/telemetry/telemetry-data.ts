import { createServerFn } from "@tanstack/react-start"
import { sql } from "drizzle-orm"
import { db } from "@/db"
import { devices, type ValueType } from "@/db/schema"
import type { ChartRangeDays } from "@/lib/chart-range"

const validBucketSeconds = new Set([900, 3600, 7200])

function bucketSeconds(rangeDays: ChartRangeDays): number {
	if (rangeDays === 1) return 900 // 15-minute buckets
	if (rangeDays === 4) return 3600 // 1-hour buckets
	return 7200 // 2-hour buckets
}

type AggregatedMeasurementRow = {
	externalId: string
	metricKey: string
	displayName: string
	valueType: ValueType
	valueNumber: number | null
	valueBool: boolean | null
	unitSymbol: string | null
	bucketAt: string | Date
}

type RawDistanceRow = {
	timestamp: string | Date
	valueNumber: number | null
}

export type TelemetryDevice = {
	id: string
	deviceId: string
	createdAt: string
}

export type TelemetryMeasurement = {
	id: string
	deviceId: string
	metricKey: string
	displayName: string
	valueType: ValueType
	valueNumber: number | null
	valueText: string | null
	valueBool: boolean | null
	unitSymbol: string
	timestamp: string
}

export type DistanceReading = {
	timestamp: string
	value: number
}

export type TelemetryDashboardData = {
	devices: TelemetryDevice[]
	measurements: TelemetryMeasurement[]
	distanceReadings: DistanceReading[]
}

export const getTelemetryDashboardData = createServerFn({ method: "GET" })
	.inputValidator(validateChartRangeDays)
	.handler(async ({ data: rangeDays }): Promise<TelemetryDashboardData> => {
		const receivedAfter = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)
		const bucket = bucketSeconds(rangeDays)
		if (!validBucketSeconds.has(bucket)) {
			throw new Error(`Invalid bucket size: ${bucket}`)
		}
		const bucketLiteral = sql.raw(String(bucket))

		const deviceRows = await db
			.select({
				id: devices.id,
				externalId: devices.externalId,
				createdAt: devices.createdAt,
			})
			.from(devices)
			.orderBy(devices.externalId)

		const measurementRows = await db.execute<AggregatedMeasurementRow>(sql`
			SELECT
				d.external_id                                                        AS "externalId",
				md.metric_key                                                        AS "metricKey",
				md.display_name                                                      AS "displayName",
				md.value_type                                                        AS "valueType",
				AVG(m.value_number)                                                  AS "valueNumber",
				BOOL_OR(m.value_bool)                                                AS "valueBool",
				MAX(u.symbol)                                                        AS "unitSymbol",
				to_timestamp(
					FLOOR(EXTRACT(EPOCH FROM ie.received_at) / ${bucketLiteral}) * ${bucketLiteral}
				)                                                                    AS "bucketAt"
			FROM measurements m
			INNER JOIN ingest_events ie    ON m.event_id      = ie.id
			INNER JOIN devices d           ON ie.device_id    = d.id
			INNER JOIN measurement_definitions md ON m.definition_id = md.id
			LEFT  JOIN units u             ON m.unit_id       = u.id
			WHERE ie.received_at >= ${receivedAfter}
			GROUP BY
				d.external_id,
				md.metric_key,
				md.display_name,
				md.value_type,
				to_timestamp(FLOOR(EXTRACT(EPOCH FROM ie.received_at) / ${bucketLiteral}) * ${bucketLiteral})
			ORDER BY "bucketAt" DESC
		`)

		const distanceRows = await db.execute<RawDistanceRow>(sql`
			SELECT
				to_timestamp(FLOOR(EXTRACT(EPOCH FROM ie.received_at) / 2) * 2) AS "timestamp",
				MIN(m.value_number)                                               AS "valueNumber"
			FROM measurements m
			INNER JOIN ingest_events ie         ON m.event_id      = ie.id
			INNER JOIN measurement_definitions md ON m.definition_id = md.id
			WHERE ie.received_at >= ${receivedAfter}
			  AND md.metric_key  = 'distance_cm'
			  AND m.value_number IS NOT NULL
			GROUP BY to_timestamp(FLOOR(EXTRACT(EPOCH FROM ie.received_at) / 2) * 2)
			ORDER BY "timestamp" ASC
		`)

		return {
			devices: deviceRows.map((row) => ({
				id: row.id,
				deviceId: row.externalId,
				createdAt: row.createdAt.toISOString(),
			})),
			measurements: measurementRows.rows.map((row) => {
				const timestamp = new Date(row.bucketAt).toISOString()
				return {
					id: `${row.externalId}-${row.metricKey}-${timestamp}`,
					deviceId: row.externalId,
					metricKey: row.metricKey,
					displayName: row.displayName,
					valueType: row.valueType,
					valueNumber: row.valueNumber !== null ? Number(row.valueNumber) : null,
					valueText: null,
					valueBool: row.valueBool,
					unitSymbol: row.unitSymbol ?? "",
					timestamp,
				}
			}),
			distanceReadings: distanceRows.rows.flatMap((row) => {
				if (row.valueNumber === null) return []
				return [{ timestamp: new Date(row.timestamp).toISOString(), value: Number(row.valueNumber) }]
			}),
		}
	})

function validateChartRangeDays(value: unknown): ChartRangeDays {
	if (value === 1 || value === "1") {
		return 1
	}

	if (value === 4 || value === "4") {
		return 4
	}

	if (value === 7 || value === "7") {
		return 7
	}

	return 1
}
