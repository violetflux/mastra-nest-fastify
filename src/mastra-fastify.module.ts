import type { DynamicModule, Provider } from '@nestjs/common'
import type {
  MastraFastifyModuleAsyncOptions,
  MastraFastifyModuleOptions,
} from './interfaces'
import { Module } from '@nestjs/common'
import { MASTRA_FASTIFY_OPTIONS } from './constants'
import { MastraFastifyService } from './mastra-fastify.service'

/** 在 NestJS 中注册官方 Mastra Fastify Adapter */
@Module({})
export class MastraFastifyModule {
  /** 使用静态配置注册 */
  public static register(
    options: MastraFastifyModuleOptions,
  ): DynamicModule {
    return this._createModule({
      provide: MASTRA_FASTIFY_OPTIONS,
      useValue: options,
    })
  }

  /** 使用 Nest 依赖注入异步创建配置 */
  public static registerAsync(
    options: MastraFastifyModuleAsyncOptions,
  ): DynamicModule {
    return this._createModule({
      provide: MASTRA_FASTIFY_OPTIONS,
      inject: options.inject ?? [],
      useFactory: options.useFactory,
    }, options.imports)
  }

  /** 创建包含生命周期 Service 的动态模块 */
  private static _createModule(
    optionsProvider: Provider,
    imports: MastraFastifyModuleAsyncOptions['imports'] = [],
  ): DynamicModule {
    return {
      module: MastraFastifyModule,
      imports,
      providers: [
        optionsProvider,
        MastraFastifyService,
      ],
      exports: [
        MastraFastifyService,
      ],
    }
  }
}
