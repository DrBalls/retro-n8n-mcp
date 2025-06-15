# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 PROTOCOL VERSION: v1.1 (January 15, 2025)

### Protocol Changelog:
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

2. **Read Core Documents**
   ```
   1. Read this CLAUDE.md file for protocol updates
   2. Check TaskMaster: mcp__taskmaster-ai__get_tasks for current task list
   3. Check TaskMaster: mcp__taskmaster-ai__next_task to identify priority
   4. Review any existing code/documentation relevant to session goals
   ```

3. **Report Initial Status**
   ```
   "Session Status:
   - Git: [Clean/Has changes]
   - Current Tasks: [X pending, Y in-progress, Z completed]
   - Next Priority: [Task #N - Title]
   - Session Goal: [What we'll focus on today]"
   ```

4. **Create Session Plan**
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
└── docs/                     # Additional documentation
```

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

### TaskMaster Integration
- **Issue**: TaskMaster not finding tasks despite file existing
- **Solution**: Ensure tasks.json is in `.taskmaster/tasks/` directory
- **Alternative**: Use existing tasks.json in `/tasks/` directory

---

*This file implements a self-improving session protocol. The protocol MUST be evaluated at the end of each session, with improvements implemented immediately for the next session.*