# GitHub Copilot Instructions for Hypotrophy

This file provides context and instructions to help GitHub Copilot provide better suggestions for this repository.

## Project Context
- **Repository Purpose**: AI-enhanced development platform with comprehensive GitHub Copilot integration
- **Development Philosophy**: AI-first approach to software engineering and project management
- **Code Quality**: Emphasis on maintainable, secure, well-documented code with comprehensive testing

## Code Style Guidelines

### General Principles
- Write self-documenting code with descriptive names
- Include comprehensive error handling
- Follow single responsibility principle
- Prefer composition over inheritance
- Use modern language features appropriately

### JavaScript/TypeScript
```javascript
// Preferred function documentation style
/**
 * Calculates user subscription cost with discounts and taxes
 * @param {Object} user - User object with membership details
 * @param {Object} plan - Subscription plan details
 * @param {Array} discounts - Available discount codes
 * @returns {Object} Cost breakdown with totals
 */
async function calculateSubscriptionCost(user, plan, discounts) {
  // Implementation with proper error handling
  try {
    // Business logic here
  } catch (error) {
    throw new Error(`Failed to calculate subscription cost: ${error.message}`);
  }
}
```

### Python
```python
def process_user_data(user_id: str, data: dict) -> dict:
    """
    Process and validate user data with comprehensive error handling.
    
    Args:
        user_id: Unique identifier for the user
        data: Dictionary containing user data to process
        
    Returns:
        dict: Processed and validated user data
        
    Raises:
        ValueError: If user_id is invalid or data is malformed
        ProcessingError: If data processing fails
    """
    # Implementation here
```

## Architecture Patterns

### API Design
- RESTful endpoints with clear resource naming
- Consistent error response format
- Comprehensive input validation
- Rate limiting and security headers
- OpenAPI/Swagger documentation

### Database Patterns
- Use migrations for schema changes
- Include proper indexing strategies
- Implement soft deletes where appropriate
- Add audit trails for sensitive operations
- Use connection pooling

### Testing Strategy
- Unit tests for all business logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Mock external dependencies
- Maintain high test coverage (>80%)

## Security Guidelines

### Input Validation
```javascript
// Always validate and sanitize inputs
function validateUserInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input provided');
  }
  
  // Sanitize and validate
  const sanitized = input.trim().toLowerCase();
  
  if (sanitized.length < 1 || sanitized.length > 255) {
    throw new Error('Input length must be between 1 and 255 characters');
  }
  
  return sanitized;
}
```

### Authentication & Authorization
- Use JWT tokens with appropriate expiration
- Implement role-based access control
- Log all authentication attempts
- Use secure password hashing (bcrypt)
- Implement rate limiting for auth endpoints

## Error Handling Patterns

### Consistent Error Structure
```javascript
class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'APIError';
  }
}

// Usage
throw new APIError('User not found', 404, 'USER_NOT_FOUND');
```

### Logging Strategy
- Use structured logging (JSON format)
- Include correlation IDs for tracing
- Log errors with sufficient context
- Sanitize sensitive data from logs
- Use appropriate log levels

## AI-Specific Guidelines

### Writing AI-Friendly Code
1. **Descriptive Comments**: Explain business logic and complex algorithms
2. **Clear Function Names**: Use verbs that describe what the function does
3. **Type Annotations**: Use TypeScript or type hints where possible
4. **Consistent Patterns**: Follow established patterns in the codebase
5. **Modular Design**: Break complex functions into smaller, focused units

### Copilot Chat Prompts
Use these patterns when interacting with Copilot Chat:

```
/explain this function step by step
/tests generate unit tests for this module
/fix improve error handling and add input validation
/docs generate JSDoc comments for this function
/refactor extract common patterns into reusable utilities
/security review this code for potential vulnerabilities
```

## Performance Considerations

### Database Queries
- Use indexes for frequently queried fields
- Implement pagination for large result sets
- Use prepared statements to prevent SQL injection
- Monitor query performance and optimize N+1 queries
- Implement caching strategies for read-heavy operations

### API Performance
- Implement response caching where appropriate
- Use compression for large responses
- Implement request/response size limits
- Monitor response times and set SLA goals
- Use CDN for static assets

## Documentation Standards

### Code Documentation
- Document public APIs with examples
- Explain complex business logic
- Include usage examples in comments
- Document error conditions and handling
- Keep documentation up-to-date with code changes

### API Documentation
- Use OpenAPI/Swagger specifications
- Include request/response examples
- Document error codes and messages
- Provide authentication instructions
- Include rate limiting information

## Testing Guidelines

### Unit Testing
```javascript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
    });
    
    it('should throw error with invalid email', async () => {
      // Arrange
      const userData = { email: 'invalid-email', name: 'Test User' };
      
      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });
});
```

### Integration Testing
- Test API endpoints with realistic data
- Verify database operations
- Test authentication and authorization
- Validate error responses
- Check side effects and state changes

## Deployment and Operations

### Environment Configuration
- Use environment variables for configuration
- Provide sensible defaults where possible
- Validate configuration on startup
- Document all required environment variables
- Use secrets management for sensitive data

### Monitoring and Observability
- Implement health check endpoints
- Add metrics for key business operations
- Use distributed tracing for microservices
- Set up alerts for error rates and performance
- Monitor resource usage and scaling metrics

## Contributing Guidelines

### Code Review Checklist
- [ ] Code follows established patterns
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Security considerations addressed
- [ ] Performance implications considered

### Git Workflow
- Use descriptive commit messages
- Keep commits focused and atomic
- Use branch naming conventions
- Squash commits before merging
- Include issue references in commits

---

These instructions help GitHub Copilot understand the project context and provide better, more relevant suggestions aligned with the project's goals and standards.