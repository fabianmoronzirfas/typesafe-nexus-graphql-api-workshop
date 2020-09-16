/* eslint-disable @typescript-eslint/no-var-requires */
// tests/nexus-test-environment.js
// taken from here https://gist.github.com/fabianmoronzirfas/8b0dfed60476800211d31c82003ddfe6
const NodeEnvironment = require('jest-environment-node')
const { nanoid } = require('nanoid')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const path = require('path')

const prismaBinary = './node_modules/.bin/prisma'

/**
 * Custom test environment for Nexus, Prisma and Postgres
 */
class PrismaTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)

    this.dbName = `test_${nanoid()}.db`
    // Generate the pg connection string for the test schema
    this.databaseUrl = `file:./${this.dbName}`
  }

  async setup() {
    // Set the required environment variable to contain the connection string
    // to our database test schema
    process.env.DATABASE_URL = this.databaseUrl
    this.global.process.env.DATABASE_URL = this.databaseUrl

    // Run the migrations to ensure our schema has the required structure
    await exec(`${prismaBinary} migrate up --create-db --experimental`)

    return super.setup()
  }

  async teardown() {
    fs.unlinkSync(path.join(__dirname, '..', 'prisma', this.dbName))
  }
}

module.exports = PrismaTestEnvironment
