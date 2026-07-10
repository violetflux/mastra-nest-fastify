import type { HttpAdapterHost } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import multipart from '@fastify/multipart'
import { Mastra } from '@mastra/core/mastra'
import { Body, Controller, Module, Post } from '@nestjs/common'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { Test } from '@nestjs/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MastraFastifyModule,
  MastraFastifyService,
} from '../src'

@Controller('nest')
class TestController {
  @Post('echo')
  public echo(@Body() body: unknown) {
    return body
  }
}

@Module({
  controllers: [TestController],
})
class TestModule {}

const PREFIX_TOKEN = Symbol('PREFIX')

@Module({
  providers: [
    {
      provide: PREFIX_TOKEN,
      useValue: '/async_mastra',
    },
  ],
  exports: [PREFIX_TOKEN],
})
class PrefixModule {}

describe('mastraFastifyModule', () => {
  let app: NestFastifyApplication | undefined

  afterEach(async () => {
    await app?.close()
    app = undefined
  })

  it('在 Fastify 子作用域挂载 Mastra 并保留 Nest parser', async () => {
    const mastra = new Mastra()
    const shutdown = vi.spyOn(mastra, 'shutdown').mockResolvedValue()
    const moduleRef = await Test.createTestingModule({
      imports: [
        TestModule,
        MastraFastifyModule.register({
          mastra,
          prefix: '/api_mastra',
          openapiPath: '/openapi.json',
          afterInit: ({ app: fastify }) => {
            fastify.get('/api_mastra/custom', async () => ({ ok: true }))
          },
        }),
      ],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await app.register(multipart)
    await app.init()

    const fastify = app.getHttpAdapter().getInstance()
    const agents = await fastify.inject({
      method: 'GET',
      url: '/api_mastra/agents',
    })
    const custom = await fastify.inject({
      method: 'GET',
      url: '/api_mastra/custom',
    })
    const openapi = await fastify.inject({
      method: 'GET',
      url: '/api_mastra/openapi.json',
    })
    const echo = await fastify.inject({
      method: 'POST',
      url: '/nest/echo',
      payload: { value: 1 },
    })

    expect(agents.statusCode).toBe(200)
    expect(custom.json()).toEqual({ ok: true })
    expect(openapi.statusCode).toBe(200)
    expect(echo.json()).toEqual({ value: 1 })
    expect(fastify.hasContentTypeParser('multipart/form-data')).toBe(true)

    await app.close()
    app = undefined
    expect(shutdown).toHaveBeenCalledOnce()
  })

  it('支持通过 Nest 依赖注入异步创建配置', async () => {
    const mastra = new Mastra()
    const moduleRef = await Test.createTestingModule({
      imports: [
        MastraFastifyModule.registerAsync({
          imports: [PrefixModule],
          inject: [PREFIX_TOKEN],
          useFactory: (prefix: string) => ({
            mastra,
            prefix,
          }),
        }),
      ],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    await app.init()

    const response = await app.getHttpAdapter().getInstance().inject({
      method: 'GET',
      url: '/async_mastra/agents',
    })

    expect(response.statusCode).toBe(200)
  })

  it('拒绝运行在非 Fastify Nest Adapter 上', async () => {
    const service = new MastraFastifyService(
      { mastra: new Mastra() },
      {
        httpAdapter: {
          getType: () => 'express',
        },
      } as HttpAdapterHost,
    )

    await expect(service.onModuleInit()).rejects.toThrow(
      'requires the NestJS Fastify adapter',
    )
  })
})
