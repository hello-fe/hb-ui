/**
 * 1234567.89 -> 1,234,567.89
 */
export function thousandPoints(num: string | number) {
  if (num == null || Number.isNaN(+num)) {
    return num
  }
  try {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  } catch (error) {
    return num
  }
}
