export function exportToCSV(data, columns, filename = 'export.csv') {
  if (!data || data.length === 0) return

  const headers = columns
    .filter(col => col.accessorKey || col.id)
    .map(col => col.header || col.accessorKey || col.id)

  const accessorKeys = columns
    .filter(col => col.accessorKey || col.id)
    .map(col => col.accessorKey || col.id)

  const rows = data.map(row =>
    accessorKeys.map(key => {
      const val = row[key]
      if (val === null || val === undefined) return ''
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    }).join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
