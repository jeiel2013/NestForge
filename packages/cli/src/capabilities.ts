export const CAPABILITIES = `
Supported NestForge combinations

Languages:
  typescript, javascript

ORMs and databases:
  prisma    postgres, mysql, sqlite, mongodb
  typeorm   postgres, mysql, sqlite
  drizzle   postgres, mysql, sqlite
  none      no database

Authentication:
  jwt, session, oauth, none

Projects without an ORM currently support only authentication "none".
MongoDB is currently available only with Prisma.
`.trim();
