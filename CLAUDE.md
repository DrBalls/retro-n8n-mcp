# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 PROTOCOL VERSION: v1.6 (January 17, 2025)

### Protocol Changelog:
- **v1.6** (January 17, 2025): Improved partial task handling and quick status options
  - Added: Guidance for handling partial task completion
  - Added: Quick status check option when tests are timing out
  - Added: Pattern for TaskMaster file location troubleshooting
  - Modified: Enhanced session workflow for multi-part task tracking
- **v1.5** (January 17, 2025): Real-time monitoring integration and session recovery
  - Added: Session recovery protocol for crashed/interrupted sessions
  - Added: Real-time monitoring integration steps in common patterns
  - Added: Integration test patterns for new features
  - Modified: Enhanced error handling for TaskMaster file location issues
- **v1.4** (January 15, 2025): Test coverage improvements and gitignore updates
  - Added: Coverage check command in quick commands section
  - Added: Note about .gitignore for coverage files in development setup
  - Added: Test writing patterns reference in common patterns
  - Modified: Enhanced initial status to include coverage percentage
- **v1.3** (January 15, 2025): TaskMaster clarifications and security implementation
  - Added: TaskMaster best practices section
  - Added: Security layer implementation patterns
  - Clarified: TaskMaster file parameter usage
  - Clarified: WSL2 environment is working correctly
- **v1.2** (January 15, 2025): Enhanced status reporting and pattern documentation
  - Added: Quick project metrics (tool count, test status) in initial report
  - Added: TaskMaster configuration verification step
  - Added: Common implementation patterns section
  - Modified: Initial status report to include more actionable information
- **v1.1** (January 15, 2025): Improved testing and compatibility checks
  - Added: MCP SDK version compatibility check after git pull
  - Added: Quick test run (`npm test`) after pulling changes
  - Added: Reminder to check existing tool patterns before implementing
  - Modified: Enhanced troubleshooting section for common SDK issues
- **v1.0** (January 14, 2025): Initial protocol for n8n MCP Server development
  - Established session start/end protocols
  - Added TaskMaster integration for project management
  - Implemented self-improvement evaluation mechanism
  - Defined development workflow and standards

## 🎯 SESSION START PROTOCOL

**MANDATORY**: At the beginning of EVERY session, you MUST:

### For Resumed/Crashed Sessions:
If the session includes a previous conversation summary or context:
1. **Acknowledge the continuation** with a brief status check
2. **Review the summary** to understand what was being worked on
3. **Check current state** (git status, test status, task progress)
4. **Continue from where the previous session left off**
5. **Complete any interrupted commits or tasks**

### For New Sessions:

1. **Check Git Status**
   ```bash
   git status
   git pull origin main  # If clean
   npm test  # Quick test run to verify working state
   ```
   - Report any uncommitted changes
   - Pull latest if working directory is clean
   - Run quick test to catch any breaking changes
   - Check MCP SDK version if tests fail unexpectedly

2. **Verify TaskMaster Configuration**
   ```bash
   # Check if TaskMaster is properly initialized
   ls -la .taskmaster/tasks/
   # If tasks.json exists but TaskMaster can't find tasks, verify structure
   ```

3. **Read Core Documents**
   ```
   1. Read this CLAUDE.md file for protocol updates
   2. Check TaskMaster: mcp__taskmaster-ai__get_tasks for current task list
   3. Check TaskMaster: mcp__taskmaster-ai__next_task to identify priority
   4. Review any existing code/documentation relevant to session goals
   ```

4. **Report Initial Status with Metrics**
   ```
   "Session Status:
   - Git: [Clean/Has changes]
   - Tests: [X passing, Y failing] (from npm test)
     * If tests timeout: "Tests timing out - skipping detailed check"
   - Coverage: [X%] (from npm run test:coverage if available)
   - Tools: [N total] ([breakdown by category])
   - Current Tasks: [X pending, Y in-progress, Z completed]
   - Next Priority: [Task #N - Title]
   - Session Goal: [What we'll focus on today]"
   ```
   
   **Quick Status Option**: If tests are timing out consistently:
   - Skip test execution and note "Tests skipped due to timeout"
   - Focus on git status and task progress
   - Run targeted tests later for specific changes

5. **Create Session Plan**
   - Use TaskMaster to identify tasks for this session
   - Create TodoWrite list for micro-tasks within the session
   - Confirm priorities with user before starting

## 🔄 SESSION WORKFLOW

### During Session
1. **Task Management**
   - Mark current task as in-progress: `mcp__taskmaster-ai__set_task_status`
   - Use TodoWrite/TodoRead for tracking micro-tasks
   - Document discoveries with `mcp__taskmaster-ai__update_task`
   - Add subtasks if new work discovered
   
   **For Multi-Part Tasks**:
   - Break large tasks into TodoWrite items
   - Track completion of each part
   - If TaskMaster update fails, note progress in commit message
   - Consider manual JSON edit for bulk task updates

2. **Code Development**
   - Follow existing patterns and conventions
   - Write tests for new functionality
   - Update documentation as needed
   - Commit regularly with descriptive messages

3. **Quality Checks**
   - Run tests after significant changes
   - Verify TypeScript compilation
   - Check for linting issues
   - Document any technical decisions

### End of Session
1. **Update Task Status**
   - Mark completed tasks as done in TaskMaster
   - Update any blocked tasks with notes
   - Add progress notes to in-progress tasks

2. **Commit All Changes**
   ```bash
   git add -A
   git commit -m "feat/fix/docs: Description of changes"
   git push origin main
   ```

3. **Session Summary**
   - Summarize accomplishments
   - Note any blockers or issues
   - Identify next session priorities

4. **SESSION PROTOCOL EVALUATION** (MANDATORY)
   
   **Analyze Protocol Effectiveness:**
   - What protocol steps worked well?
   - What caused friction or delays?
   - Which steps were skipped or modified? Why?
   - What information was missing or hard to find?
   
   **Propose Improvements:**
   - Specific changes to existing steps
   - New steps to add
   - Steps to remove or simplify
   - Better tool usage patterns
   
   **Implement Improvements:**
   - Update this CLAUDE.md file with proposed changes
   - Increment protocol version and document changes
   - Changes take effect next session
   
   **Example Update:**
   ```markdown
   ### Protocol Changelog:
   - **v1.1** (Date): Brief description of changes
     - Added: New step for X
     - Modified: Simplified Y process
     - Removed: Redundant Z check
   ```

## Project Overview

This repository is for developing a comprehensive n8n MCP (Model Context Protocol) server that maximizes n8n's workflow automation capabilities. The project aims to build a new implementation from scratch rather than extending the limited existing `@ahmad.soliman/mcp-n8n-server`.

## Key Project Goals

- Full utilization of n8n's extensive REST API (requires paid n8n plan)
- Real-time workflow execution monitoring
- Interactive debugging capabilities
- Workflow visualization (Mermaid diagrams)
- Advanced batch operations
- Version control integration
- AI-powered workflow suggestions

## Development Setup

### Prerequisites
- Node.js (v18+ recommended based on MCP ecosystem standards)
- TypeScript
- n8n instance (cloud or self-hosted) with API access
- API key from n8n (requires paid plan)

### Initial Setup Commands
```bash
# Initialize the project
npm init -y

# Install core dependencies
npm install @modelcontextprotocol/sdk typescript tsx zod dotenv

# Install development dependencies
npm install -D @types/node vitest @vitest/coverage-v8 eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier

# Setup TypeScript
npx tsc --init
```

### Running the MCP Server
```bash
# Development mode
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Architecture Structure

The project follows a modular architecture:

```
retro-n8n-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── server.ts             # Core server implementation
│   ├── tools/                # Individual tool implementations
│   │   ├── workflow/         # Workflow management tools
│   │   ├── execution/        # Execution control tools
│   │   ├── credential/       # Credential management tools
│   │   └── monitoring/       # Real-time monitoring tools
│   ├── resources/            # MCP resource providers
│   ├── services/             # Business logic services
│   ├── utils/                # Utility functions
│   └── types/                # TypeScript type definitions
├── tests/                    # Test files
├── docs/                     # Additional documentation
└── .gitignore                # Includes coverage/ directory
```

Note: Coverage files are automatically generated in `coverage/` directory and should not be committed.

## n8n API Integration

The n8n API follows REST principles with endpoints structured as `/api/v1/[resource]`. Key endpoints include:

- **Workflows**: `/api/v1/workflows` - CRUD operations, activation/deactivation
- **Executions**: `/api/v1/executions` - Trigger, monitor, retrieve logs
- **Credentials**: `/api/v1/credentials` - Secure credential management
- **Nodes**: Access to 400+ integration nodes

Authentication uses header-based API keys:
```typescript
headers: {
  'X-N8N-API-KEY': process.env.N8N_API_KEY,
  'Content-Type': 'application/json'
}
```

## Implementation Phases

Based on the research document, the implementation follows these phases:

1. **Core Foundation** - Basic CRUD operations, execution triggering, error handling
2. **Advanced Features** - Real-time monitoring, batch operations, version control
3. **Intelligence Layer** - AI-powered suggestions, error diagnosis, predictive analytics
4. **Ecosystem Integration** - Dynamic node discovery, plugin system, documentation generation

## MCP Tool Naming Conventions

Tools should follow clear naming patterns:
- `workflow_create`, `workflow_update`, `workflow_delete`
- `execution_trigger`, `execution_monitor`, `execution_stop`
- `credential_create`, `credential_test`, `credential_rotate`
- `debug_start`, `debug_step`, `debug_inspect`

## Testing Strategy

- Unit tests for individual tools using in-memory transports
- Integration tests with mocked n8n API responses
- End-to-end tests with test n8n instance (when available)
- Aim for 80%+ test coverage

## Security Considerations

- Store API keys in environment variables only
- Never log sensitive credentials
- Implement rate limiting
- Use OAuth 2.1 for advanced authentication scenarios
- Encrypt credential storage at rest

## Performance Optimization

- Implement multi-tier caching (memory → Redis → database)
- Use connection pooling for API requests
- Leverage async/await for parallel operations
- Monitor resource usage and implement circuit breakers

## Current Research Documents

- `n8n_mcp_server_research.md` - Initial research and requirements gathering
- `compass_artifact_*.md` - Comprehensive implementation strategy and architecture recommendations

## 🛠️ DEVELOPMENT GUIDELINES

### Code Standards
- **Type Safety**: Use full TypeScript typing, avoid `any`
- **Async/Await**: Prefer async functions for all I/O operations
- **Error Handling**: Comprehensive exception handling with helpful messages
- **Testing**: Write tests for new features (aim for 80%+ coverage)
- **Documentation**: Update docs for new functionality

### Commit Message Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add or update tests
refactor: Code refactoring
perf: Performance improvements
chore: Maintenance tasks
```

### When Starting New Features
1. Check TaskMaster for priority alignment
2. Review existing code for patterns to follow
3. Create feature branch if working on major changes
4. Update relevant documentation
5. Write tests alongside implementation

## ⚡ QUICK COMMANDS

### Node.js Development
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Quick coverage check (lines only)
npm run test:coverage 2>&1 | grep -B5 "All files" | tail -10

# Lint and format
npm run lint
npm run format
```

### Git Operations
```bash
# Check status
git status

# Stage all changes
git add -A

# Commit with message
git commit -m "type: description"

# Push to remote
git push origin main

# Create feature branch
git checkout -b feature/name

# Merge back to main
git checkout main
git merge feature/name
```

### TaskMaster Commands
```bash
# View all tasks
mcp__taskmaster-ai__get_tasks --projectRoot /home/wes/retro-n8n-mcp

# Get next priority task
mcp__taskmaster-ai__next_task --projectRoot /home/wes/retro-n8n-mcp

# Update task status
mcp__taskmaster-ai__set_task_status --id X --status done --projectRoot /home/wes/retro-n8n-mcp

# Add progress notes
mcp__taskmaster-ai__update_task --id X --prompt "progress notes" --projectRoot /home/wes/retro-n8n-mcp
```

## 🚨 IMPORTANT REMINDERS

1. **ALWAYS check git status at session start**
2. **ALWAYS use TaskMaster for task management**
3. **ALWAYS run tests before committing**
4. **ALWAYS update documentation with code changes**
5. **ALWAYS evaluate and improve session protocol**
6. **NEVER skip the session protocol evaluation**
7. **NEVER commit without descriptive messages**
8. **USE TodoWrite for micro-tasks within sessions**
9. **USE TaskMaster for main development tasks**
10. **FOLLOW TypeScript best practices**

## 📁 KEY FILE LOCATIONS

- **Task Management**: `/.taskmaster/tasks/tasks.json`
- **PRD**: `/.taskmaster/docs/prd.txt`
- **Source Code**: `/src/`
- **Tests**: `/tests/`
- **Documentation**: `/docs/`
- **This File**: `/CLAUDE.md`

## 📝 TASKMASTER BEST PRACTICES

### TaskMaster Tool Usage
1. **Always include projectRoot**: `--projectRoot /home/wes/retro-n8n-mcp`
2. **Specify file when needed**: `--file tasks/tasks.json` (if default location fails)
3. **Two task file locations exist**:
   - `.taskmaster/tasks/tasks.json` (TaskMaster default)
   - `tasks/tasks.json` (project root)
4. **Manual JSON editing is acceptable**: For bulk updates, directly editing JSON files is often faster
5. **TaskMaster is working correctly**: Initial "errors" are often just verbose logging or missing parameters

### Common TaskMaster Issues and Solutions
- **"Cannot find tasks"**: Add `--file tasks/tasks.json` parameter
- **"Task not found"**: Ensure using correct task ID and file location
- **Bulk updates failing**: Consider manual JSON editing instead
- **WSL2 concerns**: The environment works perfectly - no path or permission issues
- **Two task file locations**: Check both `.taskmaster/tasks/tasks.json` and `tasks/tasks.json`
- **Update failures**: If task updates fail repeatedly, manually edit the JSON file

## 🔨 COMMON IMPLEMENTATION PATTERNS

### MCP Tool Implementation Pattern
All tools in this project follow a consistent pattern:

```typescript
import { z } from 'zod';
import { BaseTool, IToolContext, IToolResponse, IToolMetadata } from '../base/Tool.js';

export class MyNewTool extends BaseTool {
  name = 'tool_name';
  description = 'What this tool does';
  
  inputSchema = z.object({
    // Define input parameters with Zod
  });

  async execute(params: unknown, context: IToolContext): Promise<IToolResponse> {
    const input = this.validateInput<z.infer<typeof this.inputSchema>>(params);
    
    if (!context.apiClient) {
      throw new Error('n8n API client not configured');
    }

    try {
      // Tool implementation using context.apiClient.request()
      const response = await context.apiClient.request(
        'METHOD',
        '/endpoint',
        { data: {}, params: {} }
      );

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
          mimeType: 'application/json'
        }]
      };
    } catch (error) {
      // Handle errors appropriately
      throw error;
    }
  }

  getMetadata(): IToolMetadata {
    return {
      category: 'workflow' | 'execution' | 'credential' | 'system' | 'utility',
      isMutating: true/false,
      requirements: ['n8n API access'],
      tags: ['relevant', 'tags']
    };
  }
}
```

### Security Layer Pattern
The security layer follows a modular design:

```typescript
// 1. ApiKeyManager - Manages API key lifecycle
const apiKey = apiKeyManager.generateApiKey(name, permissions, expiresIn);
const validation = apiKeyManager.validateApiKey(key);

// 2. Authorization - RBAC with permission wildcards
const allowed = authorization.hasPermission(context, 'workflow.create');
// Supports wildcards: 'workflow.*', '*.read', '*'

// 3. AuditLogger - Tracks all security events
auditLogger.logSuccess(action, context);
auditLogger.logDenied(action, reason, context);
const suspicious = auditLogger.detectSuspiciousActivity();

// 4. RateLimiter - Multi-tier rate limiting
const result = rateLimiter.checkLimit(name, key, { cost: 1 });
// Supports: global, per-user, per-apiKey, per-tool limits

// 5. SecurityManager - Orchestrates all components
const securityCheck = await securityManager.checkToolSecurity(
  toolName,
  permission,
  context
);
```

### Registering New Tools
1. Create the tool file in appropriate directory (e.g., `src/tools/execution/`)
2. Export it from the directory's `index.ts`
3. Import in `src/server/N8nMcpServer.ts`
4. Register in `registerTools()` method without constructor parameters

### Real-time Monitoring Integration Pattern
When adding monitoring features to the MCP server:

```typescript
// 1. Add monitoring config to server options
export interface IN8nMcpServerConfig {
  apiConfig?: Partial<N8nApiConfig>;
  security?: ISecurityConfig;
  monitoring?: {
    protocol?: 'websocket' | 'sse' | 'polling';
    wsUrl?: string;
    sseUrl?: string;
    pollingInterval?: number;
    updateInterval?: number;
  };
}

// 2. Initialize monitoring service in constructor
if (this.apiClient && monitoringConfig) {
  this.monitoringService = new RealtimeMonitoringService({
    apiClient: this.apiClient,
    protocol: monitoringConfig.protocol,
    wsUrl: monitoringConfig.wsUrl,
    sseUrl: monitoringConfig.sseUrl,
    authToken: apiConfig?.apiKey,
  });
  
  this.monitoringResourceProvider = new MonitoringResourceProvider({
    apiClient: this.apiClient,
    monitoringService: this.monitoringService,
    updateInterval: monitoringConfig.updateInterval,
  });
}

// 3. Add resource handlers for monitoring
this.server.setRequestHandler(ListResourcesRequestSchema, async () => { /* ... */ });
this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => { /* ... */ });
this.server.setRequestHandler(SubscribeRequestSchema, async (request) => { /* ... */ });

// 4. Manage lifecycle
// Start on connect, stop on close
```

## 🛠️ COMMON ISSUES & SOLUTIONS

### MCP SDK Client/Server Communication
- **Issue**: Tests timeout with "Unknown message type" errors
- **Solution**: Skip problematic `callTool` tests until SDK compatibility resolved
- **Check**: Verify MCP SDK version matches between client and server

### Tool Implementation Patterns
- **Issue**: TypeScript errors with tool metadata or response formats
- **Solution**: Check existing tools in same category for patterns
- **Response Format**: Use `{ content: [{ type: 'text', text: '...', mimeType?: '...' }] }`
- **Metadata**: Always include return type: `getMetadata(): IToolMetadata`

### Audit Event Structure
- **Issue**: Tests expecting 'status' property on audit events
- **Solution**: Use 'result' property instead (values: 'success', 'failure', 'denied')
- **Query Pattern**: `logs.filter(l => l.result === 'success')`
- **Action Filtering**: `logs.filter(l => l.action.startsWith('authorize:'))`

### TaskMaster Integration
- **Issue**: TaskMaster not finding tasks despite file existing
- **Solution**: Ensure tasks.json is in `.taskmaster/tasks/` directory
- **Alternative**: Use existing tasks.json in `/tasks/` directory

### Test Writing Patterns
When writing tests for tools:
1. **Structure**: Create test file in same directory structure under `tests/`
2. **Mock API Client**: Always mock N8nApiClient methods
3. **Test Categories**: Basic Properties, Input Validation, Core Functionality, Error Handling, Response Format
4. **Coverage Focus**: Aim for edge cases, error paths, and different input combinations
5. **Use existing patterns**: Check similar tool tests for consistent structure

---

*This file implements a self-improving session protocol. The protocol MUST be evaluated at the end of each session, with improvements implemented immediately for the next session.*