[English](./README.en.md) | [简体中文](./README.md)

# @violetflux/mastra-nest-fastify

A community NestJS integration for mounting the official `@mastra/fastify` Server Adapter in a NestJS Fastify application.

## Features

- Registers the Mastra Fastify Server Adapter through a Nest dynamic module.
- Supports static configuration and async configuration backed by Nest dependency injection.
- Mounts Mastra in an encapsulated Fastify scope while preserving parsers on the Nest root instance.
- Calls `mastra.shutdown()` with the Nest application lifecycle.
- Ships ESM, CommonJS, and TypeScript declarations.

## Installation

```bash
pnpm add @violetflux/mastra-nest-fastify
```

The consuming application must provide compatible versions of `@mastra/core`, NestJS, Fastify, `reflect-metadata`, and `rxjs`.

## Static Registration

```typescript
import { Module } from '@nestjs/common'
import { MastraFastifyModule } from '@violetflux/mastra-nest-fastify'
import { mastra } from './mastra'

@Module({
  imports: [
    MastraFastifyModule.register({
      mastra,
      prefix: '/api/agent',
      openapiPath: '/openapi.json',
    }),
  ],
})
export class AppModule {}
```

## Async Registration

Use async registration when the configuration depends on Nest providers:

```typescript
@Module({
  imports: [
    MastraFastifyModule.registerAsync({
      imports: [AgentModule],
      inject: [AgentService],
      useFactory: (
        agentService: AgentService,
      ) => agentService.createMastraOptions(),
    }),
  ],
})
export class AppModule {}
```

The options support the official `MastraServer` configuration and add an `afterInit` callback that exposes the encapsulated Fastify instance, the Mastra runtime, and the initialized server adapter.

## Lifecycle

The adapter creates an encapsulated Fastify scope during Nest module initialization. If the parent already has a `multipart/form-data` parser, the inherited parser is removed only inside that child scope so Mastra can register its parser without changing the Nest root instance.

When the Nest application shuts down, the adapter calls `mastra.shutdown()`. Enable Nest shutdown hooks so storage connections and active streaming resources are released cleanly.

## Compatibility

- Node.js `>=22.13.0`
- Mastra Core `>=1.50.0-0 <2.0.0-0`
- NestJS 10 or 11
- Fastify 5

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm lint
pnpm pack --dry-run
```

## License

MIT
