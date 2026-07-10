[简体中文](./README.md) | [English](./README.en.md)

# @violetflux/mastra-nest-fastify

在 NestJS Fastify 应用中挂载官方 `@mastra/fastify` Server Adapter 的社区集成包。

## 功能

- 通过 Nest 动态模块注册 Mastra Fastify Server Adapter。
- 支持静态配置和基于 Nest 依赖注入的异步配置。
- 在 Fastify 子作用域中挂载 Mastra，保留 Nest 根实例已有的 parser。
- 跟随 Nest 应用生命周期调用 `mastra.shutdown()` 释放资源。
- 同时提供 ESM、CommonJS 和 TypeScript 类型声明。

## 安装

```bash
pnpm add @violetflux/mastra-nest-fastify
```

消费项目需要提供兼容版本的 `@mastra/core`、NestJS、Fastify、`reflect-metadata` 和 `rxjs`。

## 静态注册

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

## 异步注册

需要使用 Nest 依赖注入时，可以异步创建配置：

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

配置支持官方 `MastraServer` 的参数，并额外提供 `afterInit` 回调，用于访问 Fastify 子实例、Mastra 运行时和已初始化的 Server Adapter。

## 生命周期

适配器在 Nest 模块初始化阶段创建独立的 Fastify 子作用域。若父级已经注册 `multipart/form-data` parser，仅在子作用域中移除继承项，避免 Mastra 重复注册影响 Nest 根实例。

Nest 应用关闭时，适配器会调用 `mastra.shutdown()`。应用应启用 shutdown hooks，以便正常释放 Mastra 使用的存储和流式请求资源。

## 兼容范围

- Node.js `>=22.13.0`
- Mastra Core `>=1.50.0-0 <2.0.0-0`
- NestJS 10 或 11
- Fastify 5

## 本地开发

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm lint
pnpm pack --dry-run
```

## License

MIT
