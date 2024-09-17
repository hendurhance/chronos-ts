import { getPrecisionInMilliseconds, Precision } from '../src/precision'

describe('getPrecisionInMilliseconds', () => {
  it('should return correct milliseconds for minute precision', () => {
    expect(getPrecisionInMilliseconds(Precision.MINUTE)).toBe(60000)
  })

  it('should return correct milliseconds for hour precision', () => {
    expect(getPrecisionInMilliseconds(Precision.HOUR)).toBe(3600000)
  })

  it('should return correct milliseconds for day precision', () => {
    expect(getPrecisionInMilliseconds(Precision.DAY)).toBe(86400000)
  })

  it('should return correct milliseconds for week precision', () => {
    expect(getPrecisionInMilliseconds(Precision.WEEK)).toBe(604800000)
  })

  it('should return correct milliseconds for month precision', () => {
    expect(getPrecisionInMilliseconds(Precision.MONTH)).toBe(2592000000)
  })

  it('should return correct milliseconds for year precision', () => {
    expect(getPrecisionInMilliseconds(Precision.YEAR)).toBe(31536000000)
  })

  it('should throw an error for unsupported precision', () => {
    expect(() => getPrecisionInMilliseconds('invalid' as Precision)).toThrow(
      'Unsupported precision'
    )
  })
})
