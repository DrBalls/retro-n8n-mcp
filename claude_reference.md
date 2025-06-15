# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📋 PROTOCOL VERSION: v1.3 (June 14, 2025)

### Protocol Changelog:
- **v1.3** (June 14, 2025): Added Vercel deployment as standard practice
  - Frontend should be deployed to Vercel early in development
  - Vercel deployment improves debugging and testing efficiency
  - Automatic CI/CD from GitHub eliminates deployment friction
  - Preview deployments for every commit enable rapid iteration
- **v1.2** (June 14, 2025): Added API testing improvements and standardized templates
  - Added API documentation links to session checklist
  - Created API status verification step
  - Added performance benchmarking standards
  - Included API credential verification
- **v1.1** (June 14, 2025): Added mandatory session protocol evaluation and self-improvement mechanism
- **v1.0** (June 5, 2025): Initial protocol with Taskmaster integration

## 🎯 SESSION START PROTOCOL

**MANDATORY**: At the beginning of EVERY session, you MUST:

1. **Activate Virtual Environment**
   ```bash
   # Activate the Python virtual environment
   source venv/bin/activate
   
   # Verify activation
   which python  # Should show: /home/wes/retro-core/venv/bin/python
   ```
   - Always use the project's virtual environment
   - If venv doesn't exist, create it: `python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`

2. **Sync with GitHub**
   ```bash
   # Pull latest changes from remote
   git pull origin main
   ```
   - Report any merge conflicts or issues
   - If conflicts exist, resolve them before proceeding

3. **Read Core Documents (in order)**
   ```
   1. Read: /home/wes/retro-core/DEVELOPMENT_TRACKER.md
   2. Read: /home/wes/retro-core/SESSION_TRACKER.md (last session only)
   3. Check: /home/wes/retro-core/HIDDEN_FEATURES.md (if working on enterprise features)
   4. Check: /home/wes/retro-core/API_INTEGRATION_TEST_RESULTS.md (if working on APIs)
   5. Check Taskmaster: mcp__taskmaster-ai__get_tasks to see current task list
   6. Check Taskmaster: mcp__taskmaster-ai__next_task to identify next priority
   ```
   
4. **Check System Status**
   ```bash
   # Check Docker containers
   docker ps
   
   # Check if API is running
   ps aux | grep uvicorn
   
   # Check if Celery workers are running
   ps aux | grep celery
   
   # Check which app module to use for API
   ls -la retro_core/api/ | grep -E "app.*\.py"
   ```
   - Report what's currently running
   - Determine what needs to be started based on session tasks
   - Verify correct app module (app.py vs app_dev.py) before starting API
   - Start/restart services as needed
   
5. **API Status Check (if working with integrations)**
   ```bash
   # Check configured API credentials
   python -c "
   import os
   from dotenv import load_dotenv
   load_dotenv()
   
   apis = {
       'OpenAI': os.getenv('OPENAI_API_KEY'),
       'Leonardo AI': os.getenv('LEONARDO_AI_API_KEY'),
       'Photoroom': os.getenv('PHOTOROOM_API_KEY'),
       'Replicate': os.getenv('REPLICATE_API_KEY'),
       'Printful': os.getenv('PRINTFUL_API_KEY'),
       'Printify': os.getenv('PRINTIFY_API_KEY'),
       'Pinterest': os.getenv('PINTEREST_CLIENT_ID'),
       'Stripe': os.getenv('STRIPE_SECRET_KEY'),
   }
   
   print('API Status:')
   for api, key in apis.items():
       status = '✅ Configured' if key and not key.startswith('your-') else '❌ Not configured'
       print(f'  {api}: {status}')
   "
   ```
   
6. **Report Complete Status to User**
   ```
   "System Status:
   - Docker: [PostgreSQL/Redis status]
   - API Server: [Running/Stopped]
   - Celery Workers: [Running/Stopped]
   - Git Status: [Clean/Has uncommitted changes]
   
   Project Overview:
   - RetroCore is a Commerce Platform-as-a-Service (PaaS)
   - Backend: 310+ REST endpoints + GraphQL + Voice Commerce
   - Frontend: Basic UI complete, enterprise features missing
   - Hidden Features: API monetization, mobile SDKs, ML monitoring
   
   Development Status:
   - Current Phase: [Phase X - Name]
   - Last Session: [Brief summary from SESSION_TRACKER]
   - Today's Focus: [What's next in the tracker]
   - Any blockers: [List any known issues]"
   ```

7. **Create Session Plan with Taskmaster**
   - Use `mcp__taskmaster-ai__next_task` to identify highest priority task
   - Review task dependencies with `mcp__taskmaster-ai__get_task`
   - Create session todo list from Taskmaster tasks
   - Confirm priorities with user
   - Update task status as work progresses:
     - `mcp__taskmaster-ai__set_task_status` to mark tasks in-progress/done
     - `mcp__taskmaster-ai__update_task` to add progress notes
     - `mcp__taskmaster-ai__add_subtask` for discovered work
   - Start required services for the session tasks

## 📁 DOCUMENT HIERARCHY

**ONLY reference these documents in this order:**

### 1. Primary Documents (Always Current)
- **DEVELOPMENT_TRACKER.md** - Single source of truth for progress and capabilities
- **SESSION_TRACKER.md** - Session-by-session progress log
- **CLAUDE.md** - This file, for session protocols
- **README.md** - Project overview for new users

### 2. Feature Documentation (Reference as Needed)
- **HIDDEN_FEATURES.md** - Enterprise features discovered in code review
- **ARCHITECTURE_REVIEW.md** - E-commerce feature comparison
- **FEATURE_REQUESTS.md** - User feature requests tracking
- **POD_DESIGN_INTEGRATION_STRATEGY.md** - POD design generation plan
- **API_KEYS_CHECKLIST.md** - Credential requirements

### 3. Technical Documentation (When Working on Specific Areas)
- **docs/API.md** - API documentation (when working on endpoints)
- **docs/DEPLOYMENT.md** - Deployment guide (when deploying)
- **CONTENT_API_SUMMARY.md** - Content generation endpoints
- **docs/TESTING_CHECKLIST.md** - Frontend testing guide

### 4. Archived Documents (DO NOT USE)
- Everything in `/docs/archive/` - Historical only
- Any PHASE_X_PLAN.md files - Outdated
- Sprint-specific files - Superseded by tracker
- Old session notes - Replaced by SESSION_TRACKER

## 🚀 TASKMASTER INTEGRATION

### Task Management Workflow
RetroCore now uses Taskmaster AI for comprehensive task management. All development tasks are tracked in `.taskmaster/tasks/tasks.json`.

#### Key Taskmaster Commands:
- **View Tasks**: `mcp__taskmaster-ai__get_tasks` - See all tasks with status
- **Next Priority**: `mcp__taskmaster-ai__next_task` - Find highest priority available task
- **Task Details**: `mcp__taskmaster-ai__get_task --id X` - Get specific task info
- **Update Status**: `mcp__taskmaster-ai__set_task_status --id X --status in-progress/done`
- **Add Progress**: `mcp__taskmaster-ai__update_task --id X --prompt "progress notes"`
- **Add Subtasks**: `mcp__taskmaster-ai__add_subtask --id X --title "New subtask"`
- **Expand Tasks**: `mcp__taskmaster-ai__expand_task --id X` - Generate subtasks for complex tasks

#### Task Statuses:
- **pending**: Not yet started
- **in-progress**: Currently being worked on
- **done**: Completed successfully
- **blocked**: Waiting on dependencies
- **deferred**: Postponed for later
- **cancelled**: No longer needed

#### Current Task Structure:
- 25 main tasks covering Phase 9-12 development
- Each task has been expanded with 3-5 subtasks based on complexity
- Tasks are dependency-linked for proper sequencing
- High priority: Production deployment, security, enterprise UI
- Medium priority: Voice commerce, mobile features, documentation
- Low priority: Cross-platform sessions, price alerts

## 🔄 SESSION WORKFLOW

### Start of Session
1. Pull latest changes from GitHub (`git pull origin main`)
2. Read DEVELOPMENT_TRACKER.md
3. Check Taskmaster tasks:
   - Run `mcp__taskmaster-ai__get_tasks` to see overall progress
   - Run `mcp__taskmaster-ai__next_task` to identify priorities
4. Check system/service status
5. Report both system and development status to user (including Taskmaster summary)
6. Get confirmation on priorities
7. Start required services (Docker, API, Celery, etc.)
8. Create session todos from Taskmaster tasks

### During Session
1. Mark current task as in-progress:
   - `mcp__taskmaster-ai__set_task_status --id X --status in-progress`
2. Update code/features as planned
3. **After ANY UI changes**:
   - Run Playwright regression tests on affected pages
   - Test all related tabs and navigation
   - Capture screenshots for visual verification
   - Fix any issues before proceeding to next task
   - Document test results in commit message
4. Monitor service health if debugging
5. Document progress in Taskmaster:
   - `mcp__taskmaster-ai__update_task --id X --prompt "progress notes"`
   - Add subtasks if new work discovered
6. Update tracker progress percentages
7. Note any blockers or issues
8. Commit changes regularly with descriptive messages
9. Mark tasks as done when completed:
   - `mcp__taskmaster-ai__set_task_status --id X --status done`

### End of Session
1. Update Taskmaster task statuses:
   - Ensure all completed tasks marked as done
   - Update any blocked tasks with dependencies
   - Add notes to tasks for next session
2. Update SESSION_TRACKER.md with:
   - Session summary and duration
   - Completed Taskmaster tasks (with IDs)
   - Key discoveries and decisions
   - Next session priorities (from Taskmaster)
   - Any blockers or issues
3. Update DEVELOPMENT_TRACKER.md with:
   - Major completed items
   - Progress percentages
   - Updated next tasks (aligned with Taskmaster)
   - Any architectural changes
4. Generate Taskmaster report:
   - `mcp__taskmaster-ai__get_tasks` for final status
   - Note completion percentage
5. Commit all remaining changes with descriptive messages
6. Push all changes to GitHub (`git push origin main`)
7. Summarize accomplishments to user (include Taskmaster stats)
8. Advise on whether to leave services running or shut down
   - Development work continuing soon: leave running
   - Extended break: provide shutdown commands
9. **SESSION PROTOCOL EVALUATION** (MANDATORY):
   - Analyze session protocol effectiveness:
     - What protocol steps worked well?
     - What caused friction or delays?
     - Which steps were skipped or modified? Why?
     - What information was missing or hard to find?
   - Propose protocol improvements:
     - Specific changes to existing steps
     - New steps to add
     - Steps to remove or simplify
     - Better tool usage patterns
   - Implement improvements immediately:
     - Update this CLAUDE.md file with proposed changes
     - Document rationale in SESSION_TRACKER.md
     - Changes take effect next session
   - Track protocol evolution:
     - Version protocol changes (e.g., v1.0, v1.1)
     - Maintain changelog of major improvements
     - Measure impact on session efficiency

## 📝 DEVELOPMENT TRACKING RULES

### What Goes Where:

**DEVELOPMENT_TRACKER.md**
- Current phase and overall progress
- Complete system capabilities
- Next development priorities
- Overall project metrics
- Strategic direction

**SESSION_TRACKER.md**
- Session-by-session progress
- Detailed task completions
- Technical decisions made
- Discoveries and insights
- Handoff between sessions

**HIDDEN_FEATURES.md**
- Undocumented enterprise features
- API gateway capabilities
- Voice commerce details
- Mobile platform features
- ML/AI capabilities

**TASKMASTER (.taskmaster/)**
- **tasks.json**: Complete task list with dependencies
- **task-complexity-report.json**: Complexity analysis
- **prd.txt**: Product requirements document
- Individual task files for detailed specs

**Session Work**
- Use Taskmaster for main development tasks
- Use TodoWrite/TodoRead for micro-tasks within a session
- Reference tracker for strategic direction
- Update both trackers and Taskmaster at session end

## 🚀 CURRENT PROJECT STATUS

**RetroCore** is an enterprise-grade **Commerce Platform-as-a-Service (PaaS)** that provides intelligent automation, multi-platform integration, and API monetization capabilities. Originally designed for Retro Splendor, it has evolved into a complete commerce infrastructure platform.

### Quick Status (June 2025)
- **Backend**: ✅ 100% Complete with 40% hidden enterprise features
- **Frontend**: ✅ Basic UI complete, missing enterprise features
- **Hidden Gems**: API monetization, voice commerce, GraphQL, mobile SDKs
- **Deployment**: ⏳ Ready but not deployed (Phase 9 next)

### Discovered Capabilities
- **310+ REST endpoints + GraphQL API**
- **115+ database models** including API gateway, mobile, voice
- **110+ background tasks + push notifications**
- **13 platform integrations** (11 e-commerce + 2 voice assistants)
- **Enterprise features**: API monetization, SDK generation, distributed tracing

## 🛠️ DEVELOPMENT GUIDELINES

### When Starting New Features
1. Check DEVELOPMENT_TRACKER.md for priority
2. Ensure it aligns with current phase
3. Update tracker before starting
4. Follow existing patterns in codebase

### Code Standards
- **Type Hints**: Use full Python typing
- **Async/Await**: Prefer async functions for I/O operations
- **Error Handling**: Comprehensive exception handling
- **Testing**: Write tests for new features
- **Documentation**: Update API docs for new endpoints

### Frontend Development (Phase 8)
- **Framework**: React 18+ with TypeScript
- **State**: Redux Toolkit + RTK Query
- **UI**: Material-UI or Ant Design
- **Standards**: WCAG 2.1 accessibility, responsive design
- **Testing**: Jest + React Testing Library

## 🧪 UI TESTING PROTOCOL

### Mandatory Regression Testing
**IMPORTANT**: After ANY UI changes, you MUST run regression tests before proceeding to the next task.

## 🔌 API TESTING PROTOCOL

### API Integration Testing Standards
When testing third-party API integrations, follow these standards:

1. **Pre-Testing Checklist**
   - Verify API credentials are configured (use API Status Check)
   - Check API documentation links in `API_DOCUMENTATION.md`
   - Review `API_INTEGRATION_TEST_RESULTS.md` for known issues
   - Identify correct app module (app.py vs app_dev.py)

2. **Testing Templates**
   Use standardized test scripts in `/test_templates/`:
   - `api_direct_test.py` - Direct API testing without app dependencies
   - `api_workflow_test.py` - Complete workflow testing
   - `api_performance_test.py` - Performance benchmarking

3. **Performance Benchmarking**
   Document for each API:
   - Average response time
   - Success rate percentage
   - Error types and frequencies
   - Rate limits encountered

4. **Error Handling Standards**
   - Test with invalid credentials
   - Test with rate limit scenarios
   - Test with network failures
   - Document all error responses

5. **Documentation Requirements**
   Update `API_INTEGRATION_TEST_RESULTS.md` with:
   - Service name and version
   - Test date and environment
   - Performance metrics
   - Known issues or limitations
   - Integration status (✅/⚠️/❌)

### Testing Workflow
1. **Make UI Changes**
   - Implement feature/fix
   - Verify locally in browser

2. **Run Playwright Tests**
   ```bash
   # Test main pages (dashboard, products, orders)
   ./scripts/test-ui.sh
   
   # Test all pages
   ./scripts/test-ui.sh --all
   
   # Test specific page
   ./scripts/test-ui.sh --page products
   
   # Skip screenshots
   ./scripts/test-ui.sh --no-screenshots
   ```

3. **Verify Results**
   - Check all affected pages load correctly
   - Verify navigation works
   - Ensure data displays properly
   - Check for console errors
   - Review screenshots for visual issues

4. **Fix Any Issues**
   - Address failures immediately
   - Re-run tests after fixes
   - Don't proceed until all tests pass

5. **Document in Commit**
   ```bash
   git commit -m "feat: Add new feature X
   
   - Implemented feature details
   - Playwright tests: ✅ All pages tested
   - Screenshots captured: products, dashboard
   - No regressions found"
   ```

### Test Coverage Requirements
- **New Features**: Test the new feature + related pages
- **Bug Fixes**: Test the fixed page + navigation to/from it
- **Global Changes**: Test all pages
- **Component Changes**: Test all pages using that component

## 🚀 DEPLOYMENT OPTIONS

### Quick Deployment Commands
```bash
# Option 1: Vercel + ngrok (Recommended for testing)
./scripts/run-api.sh                    # Start backend
./scripts/start-ngrok.sh                # Start tunnel
export NGROK_URL=https://abc123.ngrok.io
./scripts/deploy-vercel.sh              # Deploy frontend

# Option 2: Raspberry Pi (Full stack staging)
export PI_HOST=raspberrypi.local
./scripts/deploy-raspberry-pi.sh

# Option 3: Local Development
./scripts/start-dev.sh && ./scripts/run-api.sh
cd frontend && npm run dev
```

### Port Assignments
- **8000**: Backend API (FastAPI)
- **3100**: Frontend (React/Vite) - Reserved for RetroCore
- **5432**: PostgreSQL
- **6379**: Redis
- See `PORT_ASSIGNMENTS.md` for complete list

## ⚡ QUICK COMMANDS

### Python Environment
```bash
# Activate virtual environment (do this FIRST)
source venv/bin/activate

# Verify activation
which python              # Should show venv path

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Update dependencies
pip install --upgrade -r requirements.txt
```

### Git Operations
```bash
# Session start
git pull origin main              # Pull latest changes

# During work
git add -A                        # Stage all changes
git commit -m "feat: description" # Commit with conventional message
git status                        # Check uncommitted changes

# Session end
git push origin main              # Push all commits
```

### Service Management
```bash
# Check what's running
docker ps                          # Docker containers
ps aux | grep uvicorn             # API server
ps aux | grep celery              # Background workers

# Start everything
./scripts/start-dev.sh            # Docker services (PostgreSQL, Redis)
./scripts/run-api.sh              # API server
./scripts/run-celery.sh           # Celery worker
./scripts/run-celery-beat.sh      # Celery scheduler

# Stop everything
docker-compose down               # Stop Docker services
pkill -f uvicorn                  # Stop API server
pkill -f celery                   # Stop Celery workers

# Validate startup
./scripts/validate-startup.sh     # Check all systems
```

### Development
```bash
# Run tests
pytest

# Check code quality
black retro_core/ tests/
flake8 retro_core/ tests/
mypy retro_core/
```

### API Testing
```bash
# Check API credentials status
python -c "from test_templates.api_status_check import check_all_apis; check_all_apis()"

# Test specific API
cp test_templates/api_direct_test.py test_leonardo.py
# Edit test_leonardo.py with API details
python test_leonardo.py

# Test complete workflow
cp test_templates/api_workflow_test.py test_pod_workflow.py
# Edit test_pod_workflow.py with workflow steps
python test_pod_workflow.py

# Run performance benchmarks
cp test_templates/api_performance_test.py test_performance.py
# Edit test_performance.py with API details
python test_performance.py
```

### Database
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Check migration status
alembic current
```

## 🚨 IMPORTANT REMINDERS

1. **ALWAYS activate venv at session start (`source venv/bin/activate`)**
2. **ALWAYS pull from GitHub after venv activation**
3. **ALWAYS push to GitHub at session end**
4. **READ DEVELOPMENT_TRACKER.md first thing**
5. **NEVER reference deprecated documents in /archive/**
6. **UPDATE the tracker after significant progress**
7. **TEST all UI changes with Playwright before next task**
8. **FOLLOW the session workflow protocol**
9. **RUN regression tests after ANY frontend changes**
10. **FRONTEND is on Raspberry Pi (http://192.168.50.12), NOT localhost:3000**
11. **USE Context7 MCP for documentation lookups when appropriate**

## 🔗 Key File Locations

- **Development Tracking**: `/DEVELOPMENT_TRACKER.md`
- **Detailed History**: `/docs/DEVELOPMENT_LOG.md`
- **API Routes**: `/retro_core/api/routes/`
- **Database Models**: `/retro_core/database/models/`
- **Frontend** (Phase 8): `/frontend/src/`
- **Tests**: `/tests/`

---

*This file ensures consistent, strategic development tracking across all Claude Code sessions. The DEVELOPMENT_TRACKER.md is the single source of truth - always start there!*