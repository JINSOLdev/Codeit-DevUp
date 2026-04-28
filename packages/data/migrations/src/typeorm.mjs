import { spawn } from 'child_process'

const env = process.env.NODE_ENV || 'development'

process.env.NODE_ENV = env

const args = [
  '-r',
  'ts-node/register',
  '-r',
  'tsconfig-paths/register',
  './node_modules/typeorm/cli.js',
  '-d',
  './src/migration-data-source.ts',
  ...process.argv.slice(2)
]

console.log(`[${env}] Running TypeORM migration command`)

const child = spawn('node', args, {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: env }
})

child.on('exit', (code) => {
  process.exit(code)
})
