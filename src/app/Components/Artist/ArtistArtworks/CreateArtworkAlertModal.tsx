import { ContextModule, OwnerType } from "@artsy/cohesion"
import { BrowseSimilarWorks_artwork$data } from "__generated__/BrowseSimilarWorks_artwork.graphql"
import {
  CreateArtworkAlertModal_artwork$data,
  CreateArtworkAlertModal_artwork$key,
} from "__generated__/CreateArtworkAlertModal_artwork.graphql"
import { CreateSavedSearchModal } from "app/Components/Artist/ArtistArtworks/CreateSavedSearchModal"
import { Aggregations } from "app/Components/ArtworkFilter/ArtworkFilterHelpers"
import {
  SavedSearchEntity,
  SavedSearchEntityArtist,
  SearchCriteriaAttributes,
} from "app/Components/ArtworkFilter/SavedSearch/types"
import { extractNodes } from "app/utils/extractNodes"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { compact } from "lodash"
import { graphql, useFragment } from "react-relay"

interface CreateArtworkAlertModalProps {
  artwork: CreateArtworkAlertModal_artwork$key
  visible: boolean
  onClose: () => void
  contextModule?: ContextModule
}

export const CreateArtworkAlertModal: React.FC<CreateArtworkAlertModalProps> = ({
  artwork,
  visible,
  onClose,
  contextModule,
}) => {
  const data = useFragment<CreateArtworkAlertModalProps["artwork"]>(
    graphql`
      fragment CreateArtworkAlertModal_artwork on Artwork {
        artistSeriesConnection(first: 5) {
          edges {
            node {
              slug
            }
          }
        }
        title
        internalID
        slug
        isEligibleToCreateAlert
        artistsArray: artists {
          internalID
          name
        }
        attributionClass {
          internalID
        }
        mediumType {
          filterGene {
            slug
            name
          }
        }
      }
    `,
    artwork
  )

  const artworkAlert = useComputeArtworkAlertProps(data)

  const { isEligibleToCreateAlert } = data

  if (!isEligibleToCreateAlert) {
    return null
  }

  if (!artworkAlert) {
    return null
  }

  return (
    <CreateSavedSearchModal
      visible={visible}
      entity={artworkAlert.entity}
      attributes={artworkAlert.attributes}
      aggregations={artworkAlert.aggregations}
      closeModal={onClose}
      contextModule={contextModule}
      currentArtworkID={data.internalID}
    />
  )
}

export const useComputeArtworkAlertProps = (
  artwork: CreateArtworkAlertModal_artwork$data | BrowseSimilarWorks_artwork$data
) => {
  const enableArtistSeriesFilter = useFeatureFlag("AREnableArtistSeriesFilter")

  const { isEligibleToCreateAlert } = artwork

  if (!isEligibleToCreateAlert) {
    return null
  }

  let aggregations: Aggregations = []
  let additionalGeneIDs: string[] = []

  const artists = compact(artwork?.artistsArray)
  const attributionClass = compact([artwork?.attributionClass?.internalID])
  const formattedArtists: SavedSearchEntityArtist[] = artists.map((artist) => ({
    id: artist.internalID,
    name: artist.name || "",
  }))

  const entity: SavedSearchEntity = {
    artists: formattedArtists,
    owner: {
      type: OwnerType.artwork,
      id: artwork?.internalID ?? "",
      slug: artwork?.slug ?? "",
    },
  }

  if (artwork?.mediumType?.filterGene?.name && artwork?.mediumType?.filterGene.slug) {
    additionalGeneIDs = [artwork.mediumType.filterGene.slug]
    aggregations = [
      {
        slice: "MEDIUM",
        counts: [
          {
            name: artwork.mediumType.filterGene.name,
            value: artwork.mediumType.filterGene.slug,
            count: 0,
          },
        ],
      },
    ]
  }

  const artistSeriesIDs = enableArtistSeriesFilter
    ? extractNodes(artwork?.artistSeriesConnection).map((series) => series.slug)
    : []

  const attributes: SearchCriteriaAttributes = {
    artistIDs: formattedArtists.map((artist) => artist.id),
    attributionClass,
    additionalGeneIDs,
    artistSeriesIDs,
  }

  return {
    entity,
    attributes,
    aggregations,
  }
}
