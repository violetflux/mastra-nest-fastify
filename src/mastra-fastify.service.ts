import type {
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common'
import type { FastifyInstance } from 'fastify'
import type { MastraFastifyModuleOptions } from './interfaces'
import { MastraServer } from '@mastra/fastify'
import {
  Inject,
  Injectable,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { MASTRA_FASTIFY_OPTIONS } from './constants'

/** 管理 Mastra Fastify Adapter 的 Nest 生命周期 */
@Injectable()
export class MastraFastifyService implements OnModuleInit, OnApplicationShutdown {
  private _app?: FastifyInstance
  private _server?: MastraServer
  private _shutdown = false

  public constructor(
    @Inject(MASTRA_FASTIFY_OPTIONS)
    private readonly _options: MastraFastifyModuleOptions,
    @Inject(HttpAdapterHost)
    private readonly _httpAdapterHost: HttpAdapterHost,
  ) {}

  /** 在 Nest 开始监听前挂载 Mastra 路由 */
  public async onModuleInit() {
    const httpAdapter = this._httpAdapterHost.httpAdapter
    const adapterType = httpAdapter?.getType?.()

    if (adapterType !== 'fastify') {
      throw new Error(
        `MastraFastifyModule requires the NestJS Fastify adapter, received "${adapterType ?? 'unknown'}"`,
      )
    }

    const rootApp = httpAdapter.getInstance<FastifyInstance>()

    await rootApp.register(async (app) => {
      // Mastra 会注册自己的 multipart parser；仅在子作用域移除继承项以避免重复注册。
      if (app.hasContentTypeParser('multipart/form-data'))
        app.removeContentTypeParser('multipart/form-data')

      const { afterInit, ...serverOptions } = this._options
      const server = new MastraServer({
        ...serverOptions,
        app,
      })

      await server.init()

      this._app = app
      this._server = server

      await afterInit?.({
        app,
        mastra: this._options.mastra,
        server,
      })
    })
  }

  /** 关闭 Nest 应用时释放 Mastra 资源 */
  public async onApplicationShutdown() {
    if (this._shutdown)
      return

    this._shutdown = true
    await this._options.mastra.shutdown()
  }

  /** 获取 Mastra 运行时 */
  public getMastra() {
    return this._options.mastra
  }

  /** 获取 Mastra Fastify Adapter */
  public getServer() {
    if (!this._server)
      throw new Error('Mastra Fastify adapter has not been initialized')

    return this._server
  }

  /** 获取 Mastra 所在的 Fastify 子实例 */
  public getFastifyApp() {
    if (!this._app)
      throw new Error('Mastra Fastify app has not been initialized')

    return this._app
  }
}
