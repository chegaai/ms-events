export type QueryFieldMapper = {
  fieldName: string,
  convert: (value: any) => any
}

export type QueryFieldMap<TQueryParams = any> = { [k in keyof TQueryParams]-?: QueryFieldMapper }

export function isFieldValid <TQueryFieldMap>(queryFieldMap: TQueryFieldMap, field: any): field is keyof TQueryFieldMap {
  return Object.keys(queryFieldMap).includes(field)
}

export function getQueryFieldConverter (queryFieldMap: QueryFieldMap) {
  return ([field, value]: [string, any]) => {
    if (value === undefined) return null
    if (!isFieldValid(queryFieldMap, field)) return null

    const converter = queryFieldMap[field]
    const result = converter.convert(value)

    return result === null
      ? null
      : [converter.fieldName, result]
  }
}

export function getQueryGenerator <TQueryParams>(queryFieldMap: Record<string, QueryFieldMapper>) {
  const convertQueryField = getQueryFieldConverter(queryFieldMap)

  return (queryParams: TQueryParams, ...extras: Record<string, any>[]): Record<string, any> => {
    const generatedQueryEntries = Object.entries(queryParams)
      .map(convertQueryField)
      .filter(entries => entries !== null) as [string, string][]

    return Object.assign(
      {},
      ...extras,
      Object.fromEntries(generatedQueryEntries)
    )
  }

}
