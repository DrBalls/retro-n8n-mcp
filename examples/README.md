# n8n MCP Server Examples

This directory contains practical examples demonstrating how to use the n8n MCP Server for various automation scenarios.

## Example Categories

### 🚀 Getting Started
- [basic-workflow.ts](./basic-workflow.ts) - Create and run your first workflow
- [hello-world.ts](./hello-world.ts) - Simple webhook response workflow
- [test-connection.ts](./test-connection.ts) - Verify your setup

### 📊 Data Processing
- [csv-processing.ts](./csv-processing.ts) - Process CSV files with n8n
- [api-integration.ts](./api-integration.ts) - Connect multiple APIs
- [data-transformation.ts](./data-transformation.ts) - Transform and validate data

### 📧 Communication
- [email-automation.ts](./email-automation.ts) - Automated email workflows
- [slack-notifications.ts](./slack-notifications.ts) - Slack integration examples
- [webhook-handlers.ts](./webhook-handlers.ts) - Handle incoming webhooks

### 🔄 Advanced Workflows
- [error-handling.ts](./error-handling.ts) - Robust error handling patterns
- [conditional-logic.ts](./conditional-logic.ts) - If/else and switch nodes
- [loop-processing.ts](./loop-processing.ts) - Process items in loops

### 🎯 Version Control
- [version-control-basics.ts](./version-control-basics.ts) - Version control fundamentals
- [branching-workflow.ts](./branching-workflow.ts) - Feature branch development
- [team-collaboration.ts](./team-collaboration.ts) - Multi-developer patterns

### 🐛 Debugging
- [debug-session.ts](./debug-session.ts) - Interactive debugging example
- [troubleshooting.ts](./troubleshooting.ts) - Common issues and solutions

### 📈 Monitoring
- [real-time-monitoring.ts](./real-time-monitoring.ts) - Monitor executions live
- [performance-tracking.ts](./performance-tracking.ts) - Track workflow metrics

## Running the Examples

### Prerequisites
1. Install the n8n MCP Server
2. Configure your environment variables
3. Have an active n8n instance

### Running an Example

```bash
# Install dependencies (if not already done)
npm install

# Run an example
npx tsx examples/hello-world.ts

# Or with ts-node
npx ts-node examples/hello-world.ts
```

### Environment Setup

Create a `.env` file in the examples directory:

```env
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
```

## Example Structure

Each example follows this structure:

```typescript
/**
 * Example: [Name]
 * Description: [What it demonstrates]
 * Requirements: [Any special requirements]
 */

import { N8nMcpServer } from '@retro/n8n-mcp-server';

async function main() {
  // Example code here
}

// Run the example
main().catch(console.error);
```

## Contributing Examples

We welcome contributions! To add an example:

1. Create a new TypeScript file in the appropriate category
2. Follow the structure above
3. Include helpful comments
4. Test the example thoroughly
5. Submit a pull request

## Learning Path

New to n8n MCP Server? Follow this path:

1. Start with `test-connection.ts`
2. Create a workflow with `hello-world.ts`
3. Learn data processing with `csv-processing.ts`
4. Explore version control with `version-control-basics.ts`
5. Master debugging with `debug-session.ts`

## Need Help?

- Check the [Troubleshooting Guide](../docs/troubleshooting.md)
- Join our [Discord Server](https://discord.gg/example)
- Open an [issue](https://github.com/DrBalls/retro-n8n-mcp/issues)