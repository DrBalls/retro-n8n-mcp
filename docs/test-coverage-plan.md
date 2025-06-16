# Test Coverage Improvement Plan

## Current Status
- **Baseline Coverage: 16.79%**
- **Target Coverage: 80%+**
- **Gap: 63.21%**

## Priority Areas for Testing

### 1. Core Infrastructure (HIGH PRIORITY)
- [ ] `src/server/N8nMcpServer.ts` - 0% coverage
  - Server initialization
  - Tool registration
  - Request handling
  - Error handling
  - Lifecycle management

- [ ] `src/services/N8nApiClient.ts` - 0% coverage
  - HTTP request methods
  - Authentication
  - Error handling
  - Rate limiting
  - Response caching

### 2. Security Layer (HIGH PRIORITY)
- [ ] `src/security/ApiKeyManager.ts` - 0% coverage
- [ ] `src/security/Authorization.ts` - 0% coverage
- [ ] `src/security/AuditLogger.ts` - 0% coverage
- [ ] `src/security/RateLimiter.ts` - 0% coverage
- [ ] `src/security/SecurityManager.ts` - 0% coverage

### 3. Tool Registry (MEDIUM PRIORITY)
- [ ] `src/tools/ToolRegistry.ts` - 0% coverage
  - Tool registration
  - Tool discovery
  - Metadata management
  - Event handling

### 4. Individual Tools (MEDIUM PRIORITY)
Current tool coverage varies, need to improve:
- Workflow tools
- Execution tools
- Credential tools
- Monitoring tools
- System tools

### 5. Services (MEDIUM PRIORITY)
- [ ] Fix `SSEService.ts` tests
- [ ] Improve `WebSocketService.ts` tests
- [ ] Complete `RealtimeMonitoringService.ts` tests

### 6. Resources (LOW PRIORITY)
- [ ] `MonitoringResourceProvider.ts` - 0% coverage

## Testing Strategy

### Phase 1: Core Infrastructure (Week 1)
1. Write comprehensive tests for N8nMcpServer
2. Write tests for N8nApiClient with mocked HTTP responses
3. Ensure 80%+ coverage for these core components

### Phase 2: Security Layer (Week 1-2)
1. Test all security components with various scenarios
2. Include edge cases and error conditions
3. Test security integration

### Phase 3: Tools & Services (Week 2-3)
1. Improve tool test coverage
2. Fix problematic service tests
3. Add integration tests

### Phase 4: Integration & E2E (Week 3-4)
1. Add integration tests for critical workflows
2. Test tool combinations
3. Performance tests

## Test Types Needed

### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Focus on edge cases
- Aim for 80%+ line coverage per file

### Integration Tests
- Test component interactions
- Test with mocked n8n API
- Test security integration
- Test monitoring integration

### E2E Tests (Future)
- Test complete workflows
- Test with real n8n instance (optional)
- Performance benchmarks

## Immediate Actions

1. **Fix test infrastructure issues**
   - Resolve SSEService EventSource mocking
   - Fix any infinite loop tests
   - Ensure test runner works reliably

2. **Start with high-impact files**
   - N8nMcpServer.ts
   - N8nApiClient.ts
   - SecurityManager.ts

3. **Use existing test patterns**
   - Follow patterns from working tests
   - Maintain consistency
   - Use proper mocking strategies

## Success Metrics
- [ ] 80%+ overall line coverage
- [ ] 80%+ branch coverage
- [ ] All critical paths tested
- [ ] Tests run in < 30 seconds
- [ ] No flaky tests
- [ ] CI/CD pipeline operational

## Tools & Resources
- Vitest for test runner
- @vitest/coverage-v8 for coverage
- Mock libraries for HTTP and WebSocket
- GitHub Actions for CI/CD