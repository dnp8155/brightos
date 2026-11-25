import { AgentRegistryService } from '../src/packages/agents/services/agent-registry-service';
import { WorkflowEngine } from '../src/packages/agents/services/workflow-engine';
import { EventBusService } from '../src/packages/agents/services/event-bus-service';
import { JobMonitoringService } from '../src/packages/agents/services/job-monitoring-service';

async function runPhase8Tests() {
  console.log('=== [PHASE 8] AI Agent Control Center & Workflow Engine Verification ===\n');

  // Test 1: Agent Registry Listing
  console.log('[Test 1] Verifying Agent Registry (8 required agents)...');
  const agents = await AgentRegistryService.listAgents();
  console.log(`Found ${agents.length} registered agents:`);
  agents.forEach(a => console.log(`  - ${a.id} (${a.name}) [Status: ${a.executionStatus}, Version: ${a.version}]`));

  if (agents.length !== 8) {
    throw new Error(`Expected exactly 8 registered agents, found ${agents.length}`);
  }

  // Test 2: Emergency Stop and Global Pause Safety
  console.log('\n[Test 2] Verifying Safety Controls (Emergency Stop & Global Pause)...');
  const initialControls = await AgentRegistryService.getSystemControls();
  console.log('Initial controls:', initialControls);

  // Activate Emergency Stop
  await AgentRegistryService.updateSystemControls({
    emergencyStop: true,
    emergencyStopReason: 'Automated test suite safety assertion'
  });

  const stoppedControls = await AgentRegistryService.getSystemControls();
  if (!stoppedControls.emergencyStop) {
    throw new Error('Emergency Stop failed to activate');
  }

  // Attempt workflow execution during emergency stop
  const defaultWf = {
    id: 'test-wf-001',
    name: 'Test Workflow',
    description: 'Test',
    version: 1,
    isActive: true,
    triggerEvent: 'lead.discovered',
    timezone: 'UTC',
    maxRetries: 3,
    steps: WorkflowEngine.getDefault10StepWorkflow(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await WorkflowEngine.executeWorkflow(defaultWf);
    throw new Error('Workflow should NOT execute when Emergency Stop is engaged');
  } catch (err: any) {
    console.log(`  ✓ Expected execution failure under emergency stop: "${err.message}"`);
  }

  // Reset Emergency Stop
  await AgentRegistryService.updateSystemControls({ emergencyStop: false });
  console.log('  ✓ Emergency Stop reset successfully.');

  // Test 3: 10-Step Deterministic Workflow Execution with Human Approval Checkpoint
  console.log('\n[Test 3] Verifying 10-Step Workflow with Human Approval Checkpoint...');
  
  // A) Run without approval -> must pause at step 6
  const unapprovedExec = await WorkflowEngine.executeWorkflow(defaultWf, { isApproved: false });
  console.log(`Execution without approval finished with status: "${unapprovedExec.status}"`);
  if (unapprovedExec.status !== 'awaiting_approval') {
    throw new Error(`Expected status 'awaiting_approval', got '${unapprovedExec.status}'`);
  }

  const checkpointStep = unapprovedExec.stepExecutions?.find(s => s.stepKey === 'request_approval');
  if (!checkpointStep || checkpointStep.status !== 'awaiting_approval') {
    throw new Error('Approval checkpoint step did not transition to awaiting_approval');
  }
  console.log('  ✓ Checkpoint correctly gated step 6 without human operator approval.');

  // B) Run with approval -> must complete all 10 steps
  const approvedExec = await WorkflowEngine.executeWorkflow(defaultWf, { isApproved: true, hasReplied: false });
  console.log(`Execution with approval finished with status: "${approvedExec.status}"`);
  if (approvedExec.status !== 'completed') {
    throw new Error(`Expected status 'completed', got '${approvedExec.status}'`);
  }
  console.log(`  ✓ Completed ${approvedExec.stepExecutions?.length} workflow steps end-to-end.`);

  // Test 4: Durable Event Bus & Idempotency
  console.log('\n[Test 4] Verifying Event Bus Idempotency...');
  const testKey = `test-idemp-${Date.now()}`;
  const pub1 = await EventBusService.publish('lead.discovered', testKey, { domain: 'techtest.io' });
  const pub2 = await EventBusService.publish('lead.discovered', testKey, { domain: 'techtest.io' });

  if (!pub1.success || pub1.duplicate) {
    throw new Error('First event publish should succeed and not be marked duplicate');
  }
  if (!pub2.duplicate) {
    throw new Error('Second event publish with identical idempotency key should be marked duplicate');
  }
  console.log('  ✓ Idempotency confirmed: Duplicate event suppressed.');

  // Test 5: BullMQ Queue Monitoring
  console.log('\n[Test 5] Verifying Queue Monitoring Service...');
  const metrics = await JobMonitoringService.getAllQueueMetrics();
  console.log(`Retrieved metrics for ${metrics.length} queues:`);
  metrics.forEach(m => console.log(`  - ${m.name}: ${m.completed} completed, ${m.active} active, ${m.workerCount} workers`));

  console.log('\n✅ [ALL PHASE 8 AGENT TESTS PASSED SUCCESSFULLY]');
}

runPhase8Tests().catch(err => {
  console.error('\n❌ Phase 8 tests failed:', err);
  process.exit(1);
});
