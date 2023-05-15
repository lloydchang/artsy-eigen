import { ContextModule } from "@artsy/cohesion"

export type PillEntityType = "elastic" // TODO: remove

export interface PillType {
  indexName?: string
  displayName: string
  disabled?: boolean
  type: PillEntityType
  key: string
}

export interface ElasticSearchResultInterface {
  __typename: string
  displayLabel: string | null
  href: string | null
  imageUrl: string | null
  internalID?: string
  slug?: string
}

export interface TappedSearchResultData {
  query: string
  type: string
  position: number
  contextModule: ContextModule
  slug: string
  objectTab?: string
}
