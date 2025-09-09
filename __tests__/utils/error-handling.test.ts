import {
  AppError,
  ValidationError,
  AuthenticationError,
  handleError,
  measurePerformance,
  ErrorType,
  LogLevel,
  logger
} from '@/lib/utils/error-handling'

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
}

describe('Error Handling Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.error.mockRestore()
  })

  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error')
      
      expect(error.message).toBe('Test error')
      expect(error.type).toBe(ErrorType.UNKNOWN)
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
      expect(error.timestamp).toBeDefined()
      expect(error.userId).toBeUndefined()
      expect(error.context).toBeUndefined()
    })

    it('should create an AppError with custom values', () => {
      const context = { key: 'value' }
      const error = new AppError(
        'Custom error',
        ErrorType.VALIDATION,
        400,
        false,
        'user123',
        context
      )
      
      expect(error.message).toBe('Custom error')
      expect(error.type).toBe(ErrorType.VALIDATION)
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(false)
      expect(error.userId).toBe('user123')
      expect(error.context).toEqual(context)
    })
  })

  describe('ValidationError', () => {
    it('should create a ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input', 'email', 'user123')
      
      expect(error.message).toBe('Invalid input')
      expect(error.type).toBe(ErrorType.VALIDATION)
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
      expect(error.userId).toBe('user123')
      expect(error.context).toEqual({ field: 'email' })
    })
  })

  describe('AuthenticationError', () => {
    it('should create an AuthenticationError with default message', () => {
      const error = new AuthenticationError()
      
      expect(error.message).toBe('Authentication required')
      expect(error.type).toBe(ErrorType.AUTHENTICATION)
      expect(error.statusCode).toBe(401)
    })

    it('should create an AuthenticationError with custom message', () => {
      const error = new AuthenticationError('Custom auth error', 'user123')
      
      expect(error.message).toBe('Custom auth error')
      expect(error.userId).toBe('user123')
    })
  })

  describe('handleError', () => {
    it('should return AppError unchanged', () => {
      const originalError = new AppError('Test error', ErrorType.VALIDATION)
      const result = handleError(originalError)
      
      expect(result).toBe(originalError)
    })

    it('should convert Error to AppError', () => {
      const originalError = new Error('Test error')
      const result = handleError(originalError)
      
      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('Test error')
      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.isOperational).toBe(false)
    })

    it('should handle unknown error types', () => {
      const result = handleError('String error')
      
      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('An unknown error occurred')
      expect(result.type).toBe(ErrorType.UNKNOWN)
      expect(result.context?.originalError).toBe('String error')
    })

    it('should include context and userId', () => {
      const originalError = new Error('Test error')
      const context = { operation: 'test' }
      const userId = 'user123'
      
      const result = handleError(originalError, context, userId)
      
      expect(result.userId).toBe(userId)
      expect(result.context).toEqual(context)
    })
  })

  describe('measurePerformance', () => {
    beforeEach(() => {
      // Mock performance.now
      let mockTime = 0
      jest.spyOn(performance, 'now').mockImplementation(() => {
        mockTime += 100 // Each call adds 100ms
        return mockTime
      })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should measure and log successful operation', () => {
      const testFunction = jest.fn(() => 'result')
      
      const result = measurePerformance(testFunction, 'test-operation', 'user123')
      
      expect(result).toBe('result')
      expect(testFunction).toHaveBeenCalledTimes(1)
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('should measure and log failed operation', () => {
      const testError = new Error('Test error')
      const testFunction = jest.fn(() => {
        throw testError
      })
      
      expect(() => {
        measurePerformance(testFunction, 'test-operation', 'user123')
      }).toThrow(testError)
      
      expect(testFunction).toHaveBeenCalledTimes(1)
      expect(consoleSpy.log).toHaveBeenCalled()
    })
  })

  describe('Logger', () => {
    it('should log info messages', () => {
      logger.info('Test info message', { key: 'value' }, 'user123')
      
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('should log error messages', () => {
      const error = new Error('Test error')
      logger.error('Test error message', error, { key: 'value' }, 'user123')
      
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('should log debug messages', () => {
      logger.debug('Test debug message')
      
      expect(consoleSpy.log).toHaveBeenCalled()
    })

    it('should log warn messages', () => {
      logger.warn('Test warning message')
      
      expect(consoleSpy.log).toHaveBeenCalled()
    })
  })
})