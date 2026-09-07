export const CLI_HELP = `
NestForge — generate production-ready NestJS projects

Usage:
  nestforge [project-name] [options]
  nestforge --name <project-name> [options]

Commands:
  -h, --help                 Show this help
  -V, --version              Show the installed version
      --list                 List supported combinations
      --doctor               Check the local environment

Generation:
      --language <value>     typescript | javascript
      --orm <value>          prisma | typeorm | drizzle | none
      --database <value>     postgres | mysql | sqlite | mongodb | none
      --auth <value>         jwt | session | oauth | none
  -y, --yes                  Generate non-interactively with defaults
      --non-interactive      Never open configuration prompts

Feature toggles:
      --docker / --no-docker
      --swagger / --no-swagger
      --validation / --no-validation
      --redis / --no-redis
      --access-control / --no-access-control
      --env / --no-env

Output and updates:
      --no-banner            Hide the NestForge banner
      --no-update-check      Skip the automatic update check

Examples:
  nestforge
  nestforge my-api --orm prisma
  nestforge my-api --yes
  nestforge my-api --non-interactive --orm drizzle --database sqlite
`.trim();
