export type ChartRangeDays = 1 | 4 | 7

type ChartRangeOption = {
	days: ChartRangeDays
	label: string
}

export const chartRangeOptions: ChartRangeOption[] = [
	{ days: 1, label: "1 día" },
	{ days: 4, label: "4 días" },
	{ days: 7, label: "7 días" },
]

export function isWithinChartRange(timestamp: string, days: ChartRangeDays) {
	const rangeStart = Date.now() - days * 24 * 60 * 60 * 1000
	return new Date(timestamp).getTime() >= rangeStart
}
