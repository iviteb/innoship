import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

import {
  COURIERS_SCHEMA,
  SAVED_COURIERS_SCHEMA
} from '../../common/constants'

export default class Masterdata extends ExternalClient {
  public schemas = {
    schemaEntity: 'vtex_innoship',
    couriersSchema: {
      name: 'couriers',
      schema: COURIERS_SCHEMA,
    },
    savedCouriersSchema: {
      name: 'savedCouriers',
      schema: SAVED_COURIERS_SCHEMA,
    },
  }

  constructor(context: IOContext, options?: InstanceOptions) {
    super('', context, {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Vtex-Use-Https': 'true',
      },
    })
  }

  public async generateSchema(ctx: any): Promise<any> {
    try {
      await ctx.clients.masterdata.createOrUpdateSchema({
        dataEntity: this.schemas.schemaEntity,
        schemaName: this.schemas.couriersSchema.name,
        schemaBody: this.schemas.couriersSchema.schema,
      })
    } catch (error) {
      console.error(error)
    }
    try {
      await ctx.clients.masterdata.createOrUpdateSchema({
        dataEntity: this.schemas.schemaEntity,
        schemaName: this.schemas.savedCouriersSchema.name,
        schemaBody: this.schemas.savedCouriersSchema.schema,
      })
    } catch (error) {
      console.error(error)
    }
    return true
  }

  public async getDocuments(
    ctx: any,
    schemaName: any,
    type: any,
    whereClause: any = ''
  ): Promise<any> {
    let whereCls = '(type="' + type + '"'
    if (whereClause !== '1') {
      whereClause.split('__').forEach((clause: any) => {
        whereCls += ' AND ' + clause
      })
    }
    whereCls += ')'

    return await ctx.clients.masterdata.searchDocuments({
      dataEntity: this.schemas.schemaEntity,
      fields: [],
      pagination: {
        page: 1,
        pageSize: 5000,
      },
      schema: schemaName,
      where: decodeURI(whereCls),
      sort: type !== 'settings' ? 'createdIn DESC' : '',
    })
  }

  public async saveDocuments(
    ctx: any,
    schemaName: any,
    body: any
  ): Promise<any> {
    return await ctx.clients.masterdata.createOrUpdateEntireDocument({
      dataEntity: this.schemas.schemaEntity,
      fields: body,
      schema: schemaName,
      id: body.id ?? '',
    })
  }

  public async getList(
    ctx: any,
    schemaName: any,
    type: any
  ): Promise<any> {
    return await ctx.clients.masterdata.searchDocuments({
      dataEntity: this.schemas.schemaEntity,
      fields: [],
      pagination: {
        page: 1,
        pageSize: 10,
      },
      schema: schemaName,
      where: decodeURI(`(type="${type}")`),
      sort: 'createdIn DESC',
    })
  }
}
