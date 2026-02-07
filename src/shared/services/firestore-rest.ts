/**
 * Firestore REST API 客户端
 * 符合 Manifest V3 规范
 *
 * 参考：https://firebase.google.com/docs/firestore/use-rest-api
 */

export class FirestoreRest {
  private projectId: string
  private baseUrl: string

  constructor(projectId: string) {
    this.projectId = projectId
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`
  }

  /**
   * 获取文档
   */
  async getDocument(path: string, idToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Failed to get document: 404 NOT_FOUND`)
      }
      throw new Error(`Failed to get document: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return this.convertFromFirestoreFormat(data)
  }

  /**
   * 创建/更新文档
   */
  async setDocument(path: string, data: any, idToken: string): Promise<any> {
    const firestoreData = this.convertToFirestoreFormat(data)

    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: firestoreData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to set document: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 批量写入文档
   */
  async batchWrite(writes: Array<{ path: string; data: any }>, idToken: string): Promise<void> {
    const batchWrites = writes.map((write) => ({
      update: {
        name: `${this.baseUrl}/${write.path}`,
        fields: this.convertToFirestoreFormat(write.data),
      },
    }))

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents:batchWrite`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ writes: batchWrites }),
      }
    )

    if (!response.ok) {
      throw new Error(`Batch write failed: ${response.status} ${response.statusText}`)
    }
  }

  /**
   * 查询集合
   */
  async queryCollection(
    collectionPath: string,
    idToken: string,
    options?: {
      where?: Array<{ field: string; op: string; value: any }>
      orderBy?: string
      limit?: number
    }
  ): Promise<any[]> {
    const query: any = {
      structuredQuery: {
        from: [{ collectionId: collectionPath.split('/').pop() }],
      },
    }

    if (options?.where && options.where.length > 0) {
      if (options.where.length === 1) {
        query.structuredQuery.where = {
          fieldFilter: {
            field: { fieldPath: options.where[0].field },
            op: options.where[0].op,
            value: this.convertValue(options.where[0].value),
          },
        }
      } else {
        query.structuredQuery.where = {
          compositeFilter: {
            op: 'AND',
            filters: options.where.map((w) => ({
              fieldFilter: {
                field: { fieldPath: w.field },
                op: w.op,
                value: this.convertValue(w.value),
              },
            })),
          },
        }
      }
    }

    if (options?.orderBy) {
      query.structuredQuery.orderBy = [
        {
          field: { fieldPath: options.orderBy },
          direction: 'DESCENDING',
        },
      ]
    }

    if (options?.limit) {
      query.structuredQuery.limit = options.limit
    }

    const response = await fetch(`${this.baseUrl.replace('/documents', '')}:runQuery`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    })

    if (!response.ok) {
      throw new Error(`Failed to query collection: ${response.status} ${response.statusText}`)
    }

    const results = await response.json()
    return results
      .filter((r: any) => r.document)
      .map((r: any) => this.convertFromFirestoreFormat(r.document))
  }

  /**
   * 删除文档
   */
  async deleteDocument(path: string, idToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.status} ${response.statusText}`)
    }
  }

  /**
   * 转换为 Firestore 格式
   */
  private convertToFirestoreFormat(data: any): any {
    const result: any = {}

    for (const [key, value] of Object.entries(data)) {
      result[key] = this.convertValue(value)
    }

    return result
  }

  /**
   * 转换单个值
   */
  private convertValue(value: any): any {
    if (value === null || value === undefined) {
      return { nullValue: null }
    }
    if (typeof value === 'boolean') {
      return { booleanValue: value }
    }
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { integerValue: value.toString() } : { doubleValue: value }
    }
    if (typeof value === 'string') {
      return { stringValue: value }
    }
    if (value instanceof Date) {
      return { timestampValue: value.toISOString() }
    }
    if (Array.isArray(value)) {
      return {
        arrayValue: {
          values: value.map((v) => this.convertValue(v)),
        },
      }
    }
    if (typeof value === 'object') {
      return {
        mapValue: {
          fields: this.convertToFirestoreFormat(value),
        },
      }
    }

    return { stringValue: String(value) }
  }

  /**
   * 从 Firestore 格式转换回普通对象
   */
  convertFromFirestoreFormat(firestoreData: any): any {
    if (!firestoreData || !firestoreData.fields) {
      return null
    }

    const result: any = {}

    for (const [key, value] of Object.entries(firestoreData.fields)) {
      result[key] = this.extractValue(value)
    }

    return result
  }

  /**
   * 提取单个值
   */
  private extractValue(value: any): any {
    if (value.nullValue !== undefined) return null
    if (value.booleanValue !== undefined) return value.booleanValue
    if (value.integerValue !== undefined) return parseInt(value.integerValue)
    if (value.doubleValue !== undefined) return value.doubleValue
    if (value.stringValue !== undefined) return value.stringValue
    if (value.timestampValue !== undefined) return new Date(value.timestampValue)
    if (value.arrayValue !== undefined) {
      return value.arrayValue.values?.map((v: any) => this.extractValue(v)) || []
    }
    if (value.mapValue !== undefined) {
      return this.convertFromFirestoreFormat({ fields: value.mapValue.fields })
    }
    return null
  }
}
