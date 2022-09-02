import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { CareerHighlightBottomSheet_query$key } from "__generated__/CareerHighlightBottomSheet_query.graphql"
import {
  MedianSalePriceAtAuctionQuery,
  MedianSalePriceAtAuctionQuery$data,
} from "__generated__/MedianSalePriceAtAuctionQuery.graphql"
import { compact } from "lodash"
import { Flex } from "palette"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { FlatList } from "react-native-gesture-handler"
import { graphql, useRefetchableFragment } from "react-relay"
import { CareerHighlightBottomSheetItem } from "./Components/CareerHighlightBottomSheetItem"
import { useMedianSalePriceChartDataContext } from "./providers/MedianSalePriceChartDataContext"

export type CareerHighlightKindValueType =
  | "Solo Show"
  | "Group Show"
  | "Review"
  | "Biennial Inclusion"

const CareerHighlightKind: { [key: string]: CareerHighlightKindValueType } = {
  "Solo Show": "Solo Show",
  "Group Show": "Group Show",
  "Reviewed Solo Show": "Review",
  "Reviewed Group Show": "Review",
  "Biennial Inclusion": "Biennial Inclusion",
}

interface CareerHighlightBottomSheetProps {
  artistId: string
  queryData: MedianSalePriceAtAuctionQuery$data
}

export const CareerHighlightBottomSheet: React.FC<CareerHighlightBottomSheetProps> = ({
  artistId,
  queryData,
}) => {
  const [data, refetch] = useRefetchableFragment<
    MedianSalePriceAtAuctionQuery,
    CareerHighlightBottomSheet_query$key
  >(careerHighlighsBottomSheetFragment, queryData)

  if (!data) {
    return null
  }

  const dataForFlatlist = (): Array<{
    year: number
    index: number
    highlights: Record<CareerHighlightKindValueType, string[]>
  }> => {
    const eventDigest = data.analyticsArtistSparklines?.edges?.find(
      (ev) => !!parseInt(ev?.node?.sparkles ?? "", 10) && ev?.node?.eventDigest
    )?.node?.eventDigest
    if (!eventDigest) {
      return []
    }
    const careerHighlightsMap = makeCareerHighlightMap(eventDigest)
    const years = Object.keys(careerHighlightsMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    return years.map((year, index) => ({
      year: parseInt(year, 10),
      index,
      highlights: careerHighlightsMap[parseInt(year, 10)],
    }))
  }

  const dataContext = useMedianSalePriceChartDataContext()
  if (!dataContext) {
    return null
  }

  const reloadData = () => {
    refetch({ artistId })
  }

  useEffect(() => {
    reloadData()
    onXAxisHighlightPressed(null)
  }, [artistId])

  const flatlistRef = useRef<FlatList>(null)

  const { selectedXAxisHighlight, onXAxisHighlightPressed } = dataContext

  useEffect(() => {
    if (selectedXAxisHighlight) {
      const index = flatListData.find((d) => d.year === selectedXAxisHighlight)?.index
      if (index !== undefined) {
        flatlistRef.current?.scrollToIndex({ index, animated: false })
      }
    }
  }, [selectedXAxisHighlight])

  const bottomSheetRef = useRef<BottomSheet>(null)

  const snapPoints = useMemo(() => ["40%", "60%", "80%", "90%"], [])

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onXAxisHighlightPressed(null)
    }
  }, [])

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  )

  // using our custom background to ensure backgroundColor is white
  const renderBackground = useCallback(
    (props) => (
      <Flex {...props} backgroundColor="white" borderTopRightRadius={10} borderTopLeftRadius={10} />
    ),
    []
  )

  const flatListData = useMemo(
    () => dataForFlatlist(),
    [JSON.stringify(data.analyticsArtistSparklines)]
  )
  if (!flatListData.length) {
    return null
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={selectedXAxisHighlight ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundComponent={renderBackground}
    >
      <FlatList // Note that this FlatList is from "react-native-gesture-handler" in order for scrolls to work seamlessly on android. BottomSheetFlatlist shipped with BottomSheet is janky on iOS.
        testID="BottomSheetFlatlist"
        ref={flatlistRef}
        data={flatListData}
        renderItem={({ item }) => (
          <CareerHighlightBottomSheetItem year={item.year} highlights={item.highlights} />
        )}
        keyExtractor={(item) => item.year.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
    </BottomSheet>
  )
}

const careerHighlighsBottomSheetFragment = graphql`
  fragment CareerHighlightBottomSheet_query on Query
  @refetchable(queryName: "CareerHighlighsBottomSheetRefetchQuery")
  @argumentDefinitions(artistID: { type: "String!" }) {
    analyticsArtistSparklines(artistId: $artistID, last: 9) {
      edges {
        node {
          eventDigest
          sparkles
          year
        }
      }
    }
  }
`

/**
 * Prepares the eventDigest and creates a map of each year to the highlight kind
 * @param eventDigest
 * @returns Record<number, Record<CareerHighlightKindValueType, string[]>>
 * @example
 * {
 *   2014: {
 *     "Solo Show": ["ArtMuseum", "AnotherMuseum"],
 *     "Review": ["The Guardian", "The Sun"]
 *   },
 *   2015: {
 *     "Group Show": ["ArtMuseum", "AnotherMuseum"],
 *     "Biennial": ["Documenta"]
 *   },
 * }
 */
export const makeCareerHighlightMap = (
  eventDigest: string
): Record<number, Record<CareerHighlightKindValueType, string[]>> => {
  const minimumYear = new Date().getFullYear() - 8
  const result: Record<number, Record<CareerHighlightKindValueType, string[]>> = {}
  const arr = eventDigest ? eventDigest.split(";") : []
  if (!arr.length) {
    return result
  }
  for (const digest of arr) {
    // eventDigest may begin with the year, this regex extracts the first occurence
    const yearStr = digest.match(/\b(19|20)\d{2}\b/)?.[0]
    if (yearStr && parseInt(yearStr, 10) >= minimumYear) {
      const year = parseInt(yearStr, 10)
      const titleAndBody = digest.replace(`${year}`, "").trim()
      const [title, body] = titleAndBody?.split("@") ?? []
      const kind = CareerHighlightKind[title.trim()]
      const currentYear = result[year] ?? {}
      const updatedYear = { ...currentYear, [kind]: compact([...currentYear[kind], body.trim()]) }
      result[year] = updatedYear
    }
  }
  return result
}