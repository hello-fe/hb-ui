/**
 * 千分位处理
 */
export function thousandPoints(num: string | number) {
  if (!num) {
    return num
  }
  try {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  } catch (error) {
    return num
  }
}
