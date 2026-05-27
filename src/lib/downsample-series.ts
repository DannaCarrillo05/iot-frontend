type DownsampleOptions<T> = {
	series: T[]
	maxPoints: number
	getValues: (point: T) => number[]
}

export function downsampleByVariance<T>({
	series,
	maxPoints,
	getValues,
}: DownsampleOptions<T>) {
	if (series.length <= maxPoints) {
		return series
	}

	if (maxPoints < 3) {
		return series.slice(0, maxPoints)
	}

	const lastIndex = series.length - 1
	const bucketCount = Math.max(1, Math.floor((maxPoints - 2) / 2))
	const bucketSize = Math.ceil((series.length - 2) / bucketCount)
	const selectedIndexes = new Set<number>([0, lastIndex])

	for (let start = 1; start < lastIndex; start += bucketSize) {
		const end = Math.min(start + bucketSize, lastIndex)
		const average = averageBucketValues(series, start, end, getValues)
		const highVarianceIndex = findHighVarianceIndex(
			series,
			start,
			end,
			average,
			getValues,
		)
		const oppositeIndex = findMostDistantIndex(
			series,
			start,
			end,
			highVarianceIndex,
			getValues,
		)

		selectedIndexes.add(highVarianceIndex)
		selectedIndexes.add(oppositeIndex)
	}

	return Array.from(selectedIndexes)
		.sort((left, right) => left - right)
		.map((index) => series[index])
}

function averageBucketValues<T>(
	series: T[],
	start: number,
	end: number,
	getValues: (point: T) => number[],
) {
	const firstPoint = series[start]
	const firstValues = getValues(firstPoint)
	const totals = firstValues.map(() => 0)
	let count = 0

	for (let index = start; index < end; index += 1) {
		const values = getValues(series[index])
		for (let valueIndex = 0; valueIndex < totals.length; valueIndex += 1) {
			const value = values[valueIndex]
			if (typeof value === "number" && Number.isFinite(value)) {
				totals[valueIndex] += value
			}
		}
		count += 1
	}

	return totals.map((total) => total / count)
}

function findHighVarianceIndex<T>(
	series: T[],
	start: number,
	end: number,
	average: number[],
	getValues: (point: T) => number[],
) {
	let selectedIndex = start
	let selectedScore = Number.NEGATIVE_INFINITY

	for (let index = start; index < end; index += 1) {
		const score = varianceScore(getValues(series[index]), average)
		if (score > selectedScore) {
			selectedIndex = index
			selectedScore = score
		}
	}

	return selectedIndex
}

function findMostDistantIndex<T>(
	series: T[],
	start: number,
	end: number,
	anchorIndex: number,
	getValues: (point: T) => number[],
) {
	let selectedIndex = start
	let selectedScore = Number.NEGATIVE_INFINITY
	const anchorValues = getValues(series[anchorIndex])

	for (let index = start; index < end; index += 1) {
		const score = varianceScore(getValues(series[index]), anchorValues)
		if (score > selectedScore) {
			selectedIndex = index
			selectedScore = score
		}
	}

	return selectedIndex
}

function varianceScore(values: number[], baseline: number[]) {
	let score = 0

	for (let index = 0; index < baseline.length; index += 1) {
		const value = values[index]
		const base = baseline[index]
		if (typeof value === "number" && typeof base === "number") {
			const delta = value - base
			score += delta * delta
		}
	}

	return score
}
