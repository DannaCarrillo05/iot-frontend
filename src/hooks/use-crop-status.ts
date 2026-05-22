import { useMemo } from "react"
import { getCropStatusOverview } from "@/lib/status-utils"
import type { DashboardConfig } from "@/schemas/dashboard-config.schema"
import type { Alert } from "@/schemas/alert.schema"
import type { Sensor } from "@/schemas/sensor.schema"

type UseCropStatusOptions = {
	sensors: Sensor[]
	alerts: Alert[]
	config: DashboardConfig
}

export function useCropStatus({
	sensors,
	alerts,
	config,
}: UseCropStatusOptions) {
	return useMemo(
		() => getCropStatusOverview(sensors, alerts, config),
		[alerts, config, sensors],
	)
}
