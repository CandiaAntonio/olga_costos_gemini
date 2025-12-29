import { describe, it, expect } from 'vitest'
import { formatCOP } from './utils'

describe('utils', () => {
    describe('formatCOP', () => {
        it('formats numbers as COP currency', () => {
            expect(formatCOP(1000)).toBe('$ 1.000')
            expect(formatCOP(1500000)).toBe('$ 1.500.000')
            expect(formatCOP(0)).toBe('$ 0')
        })
    })
})
