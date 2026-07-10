# @violet/mastra-nest-fastify

在 NestJS Fastify 应用中挂载官方 `@mastra/fastify` Server Adapter 的社区集成包。

## 安装

```bash
pnpm add @violet/mastra-nest-fastify
```

消费项目需要提供兼容版本的 `@mastra/core`、NestJS、Fastify、`reflect-metadata` 和 `rxjs`。

## 使用

```typescript
import { Module } from '@nestjs/common'
import { MastraFastifyModule } from '@violet/mastra-nest-fastify'
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

适配器会在独立的 Fastify 子作用域中初始化 Mastra，避免覆盖 Nest 根实例已有的 JSON 和 multipart parser。关闭 Nest 应用时，适配器也会调用 `mastra.shutdown()` 释放资源。

## 兼容范围

- Node.js `>=22.13.0`
- Mastra Core `>=1.50.0-0 <2.0.0-0`
- NestJS 10 或 11
- Fastify 5

## License

MIT
