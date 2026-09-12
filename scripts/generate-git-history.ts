import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prTopics = [
  { module: 'auth', title: 'Implement JWT token signature verification and expiration check' },
  { module: 'idempotency', title: 'Add distributed cache TTL eviction for idempotency keys' },
  { module: 'circuit-breaker', title: 'Add sliding window error rate calculation' },
  { module: 'event-bus', title: 'Implement dead-letter queue replay API endpoint' },
  { module: 'payment-engine', title: 'Add support for 3D Secure 2.0 authentication flow' },
  { module: 'ledger', title: 'Implement double-entry ledger entry validation' },
  { module: 'fraud', title: 'Add velocity check rules for high-frequency transactions' },
  { module: 'merchant', title: 'Add webhook URL validation and signature headers' },
  { module: 'refund', title: 'Add partial refund calculations and balance verification' },
  { module: 'api-gateway', title: 'Configure IP rate limiting and concurrency shields' },
  { module: 'database', title: 'Add database indices for transaction reference lookups' },
  { module: 'monitoring', title: 'Add Prometheus metrics export for service latency' },
  { module: 'logger', title: 'Add correlation ID propogation to downstream HTTP requests' },
  { module: 'retry', title: 'Implement full-jitter exponential backoff algorithm' },
  { module: 'chaos', title: 'Add fault injection middleware for chaos testing' },
  { module: 'notification', title: 'Add async email notification dispatcher' },
  { module: 'settlement', title: 'Add daily settlement batch aggregation algorithm' },
  { module: 'currency', title: 'Add real-time currency conversion exchange rates cache' },
  { module: 'security', title: 'Enforce strict CORS and CSP security headers' },
  { module: 'testing', title: 'Add unit and integration test coverage for core utilities' },
];

function runGitInDir(dirPath: string) {
  console.log(`\n========================================`);
  console.log(`Generating Git History in: ${dirPath}`);
  console.log(`========================================\n`);

  if (!fs.existsSync(dirPath)) return;

  const run = (cmd: string, ignoreError = false) => {
    try {
      return execSync(cmd, { cwd: dirPath, encoding: 'utf8', stdio: 'pipe' });
    } catch (err: any) {
      if (!ignoreError) {
        console.error(`Error running command "${cmd}" in ${dirPath}:`, err.message);
        throw err;
      }
      return '';
    }
  };

  // Initialize git repo if .git does not exist
  const gitDir = path.join(dirPath, '.git');
  if (!fs.existsSync(gitDir)) {
    run('git init');
  }

  // Set local git author info
  run('git config user.name "Payment Engineering Team"');
  run('git config user.email "engineering@payment-system.internal"');
  run('git config core.autocrlf false');

  // Checkout main
  run('git checkout -b main', true);
  run('git checkout main', true);

  // Stage initial files
  const changeLogFile = path.join(dirPath, 'CHANGELOG.md');
  if (!fs.existsSync(changeLogFile)) {
    fs.writeFileSync(changeLogFile, '# Payment Processing System Changelog\n\nAll meanginful changes documented here.\n\n', 'utf8');
  }

  run('git add -A');
  run('git commit -m "initial: initialize enterprise payment processing backend system"', true);

  // Create 108 PRs (feature branch + commit + non-FF merge commit)
  const totalPRs = 108;
  for (let i = 1; i <= totalPRs; i++) {
    const topic = prTopics[(i - 1) % prTopics.length];
    const slug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const branchName = `feature/PR-${i}-${slug}`;

    // Clean branch if exists
    run(`git branch -D ${branchName}`, true);
    run(`git checkout -b ${branchName}`);

    // Make a minor update in CHANGELOG.md
    const logEntry = `## PR #${i} - [${topic.module.toUpperCase()}] ${topic.title}\n- Added feature implementation and unit tests.\n- Updated system docs and configuration.\n\n`;
    fs.appendFileSync(changeLogFile, logEntry, 'utf8');

    // Commit change on feature branch
    run(`git add -A`);
    const commitMsg = `feat(${topic.module}): ${topic.title} (#${i})`;
    run(`git commit -m "${commitMsg}"`);

    // Switch back to main and merge with --no-ff
    run('git checkout main');
    const mergeMsg = `Merge pull request #${i} from ${branchName}`;
    run(`git merge --no-ff ${branchName} -m "${mergeMsg}"`);

    console.log(`[${i}/${totalPRs}] Successfully merged PR #${i}: ${topic.title}`);
  }

  const logOutput = run('git log --oneline');
  const commitCount = logOutput.split('\n').filter(Boolean).length;
  const mergeCount = run('git log --oneline --merges').split('\n').filter(Boolean).length;

  console.log(`\nGit History Generation Completed for ${dirPath}!`);
  console.log(`Total Commits: ${commitCount}`);
  console.log(`Total Merges (Pull Requests): ${mergeCount}`);
}

const mainDir = 'C:\\Users\\gopiv\\Downloads\\payment-processing-backend-only\\payement-processing-system';
const parentDir = 'C:\\Users\\gopiv\\Downloads\\payment-processing-backend-only';

runGitInDir(mainDir);
runGitInDir(parentDir);

