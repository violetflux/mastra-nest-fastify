import type { Mastra } from '@mastra/core/mastra'
import type { MastraServer } from '@mastra/fastify'
import type { FactoryProvider, ModuleMetadata } from '@nestjs/common'
import type { FastifyInstance } from 'fastify'

/** Mastra 初始化完成后可访问的 Fastify 上下文 */
export interface MastraFastifyContext {
  /** Fastify 封装子实例 */
  app: FastifyInstance
  /** Mastra 运行时 */
  mastra: Mastra
  /** 官方 Fastify Server Adapter */
  server: MastraServer
}

/** 官方 Fastify Adapter 配置，并补充 Nest 生命周期扩展点 */
export type MastraFastifyModuleOptions = Omit<
  ConstructorParameters<typeof MastraServer>[0],
  'app'
> & {
  /** Mastra 路由初始化完成后的扩展回调 */
  afterInit?: (
    context: MastraFastifyContext,
  ) => Promise<void> | void
}

/** 异步创建模块配置 */
export interface MastraFastifyModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /** 注入到配置工厂的依赖 */
  inject?: FactoryProvider['inject']
  /** 配置工厂 */
  useFactory: (
    ...args: any[]
  ) => Promise<MastraFastifyModuleOptions> | MastraFastifyModuleOptions
}
