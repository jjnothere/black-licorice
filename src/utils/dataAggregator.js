export function aggregateDataByInterval(data, interval) {
  const consolidatedData = {}
  const aggregatedData = []
  const tempData = {}

  // Helper function to get the week number
  const getWeekNumber = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const diff =
      (date -
        startOfYear +
        (startOfYear.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000) /
      86400000
    return Math.floor(diff / 7) + 1
  }

  // Step 1: Consolidate data by day (merge entries with the same date)
  data.forEach((item) => {
    // Validate the dateRange before proceeding
    if (
      !item.dateRange ||
      !item.dateRange.start ||
      typeof item.dateRange.start.year !== 'number' ||
      typeof item.dateRange.start.month !== 'number' ||
      typeof item.dateRange.start.day !== 'number'
    ) {
      console.warn('Invalid dateRange for item:', item)
      return // Skip this item if it has invalid date information
    }

    // Construct a date object and check if it's a valid date
    const date = new Date(
      item.dateRange.start.year,
      item.dateRange.start.month - 1, // Months are 0-indexed in JavaScript
      item.dateRange.start.day
    )

    if (isNaN(date)) {
      console.warn('Invalid date constructed from dateRange:', item.dateRange)
      return // Skip this item if the date is invalid
    }

    // Use date string as the key for consolidation
    const dateKey = date.toISOString().split('T')[0]

    // Initialize or accumulate data for the same date
    if (!consolidatedData[dateKey]) {
      consolidatedData[dateKey] = {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        dateRange: {
          start: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
        }
      }
    }

    // Accumulate the values for the same day
    consolidatedData[dateKey].impressions += item.impressions || 0
    consolidatedData[dateKey].clicks += item.clicks || 0
    consolidatedData[dateKey].conversions += item.conversions || 0
    consolidatedData[dateKey].spend += parseFloat(item.spend?.replace(/[^0-9.-]+/g, '') || 0)
  })

  // Step 2: Aggregate the consolidated data by the selected interval
  Object.values(consolidatedData).forEach((item) => {
    const date = new Date(
      item.dateRange.start.year,
      item.dateRange.start.month - 1,
      item.dateRange.start.day
    )
    let key = ''

    // Aggregate by selected interval
    if (interval === 'weekly') {
      const yearWeek = `${date.getFullYear()}-W${getWeekNumber(date)}`
      key = yearWeek
    } else if (interval === 'monthly') {
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      key = yearMonth
    } else if (interval === 'quarterly') {
      const quarter = Math.floor((date.getMonth() + 3) / 3)
      key = `${date.getFullYear()}-Q${quarter}`
    } else {
      key = date.toISOString().split('T')[0] // Fallback to daily
    }

    // Initialize the aggregation data for this key if it doesn't exist
    if (!tempData[key]) {
      tempData[key] = {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        dateRange: key
      }
    }

    // Accumulate the values for this interval
    tempData[key].impressions += item.impressions || 0
    tempData[key].clicks += item.clicks || 0
    tempData[key].conversions += item.conversions || 0
    tempData[key].spend += item.spend || 0
  })

  // Push aggregated data into the final array
  Object.keys(tempData).forEach((key) => {
    aggregatedData.push(tempData[key])
  })

  return aggregatedData
}
