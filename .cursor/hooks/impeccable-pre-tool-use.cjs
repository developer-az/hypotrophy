const { homedir } = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const home = process.env.USERPROFILE || process.env.HOME || homedir()
const skillScripts = path.join(home, '.cursor', 'skills', 'impeccable', 'scripts')
const isWindows = process.platform === 'win32'
const launcher = path.join(skillScripts, isWindows ? 'impeccable.cmd' : 'impeccable')
const command = isWindows ? (process.env.ComSpec || 'cmd.exe') : launcher
const args = isWindows ? ['/d', '/c', `"${launcher}" hook-before-edit`] : ['hook-before-edit']

const result = spawnSync(command, args, {
  cwd: process.cwd(),
  input: process.stdin.fd === null ? Buffer.alloc(0) : require('node:fs').readFileSync(0),
  encoding: 'buffer',
  windowsHide: true,
})

if (result.stdout?.length) process.stdout.write(result.stdout)
if (result.stderr?.length) process.stderr.write(result.stderr)

if (result.error) {
  process.stderr.write(`Impeccable Cursor hook failed to start: ${result.error.message}\n`)
  process.exit(1)
}

process.exit(result.status ?? 1)