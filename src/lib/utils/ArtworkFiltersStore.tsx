import { union } from "lodash"
import React, { createContext, Dispatch, Reducer, useReducer } from "react"
import { SortTypes } from "../Components/ArtworkFilterOptions/SortOptions"

const filterState: ArtworkFilterContextState = {
  appliedFilters: [],
  selectedFilters: [],
  selectedSortOption: "Default",
}

interface ArtworkFilterContextState {
  appliedFilters: SortTypes[]
  selectedFilters: SortTypes[]
  selectedSortOption: SortTypes
}

export interface ResetFilters {
  type: "resetFilters"
}

// applied filters
interface ApplyFilters {
  type: "applyFilters"
  payload: SortTypes[]
}

// selected (but not applied) filters
interface SelectFilters {
  type: "selectFilters"
  payload: SortTypes
}

type FilterActions = ResetFilters | ApplyFilters | SelectFilters

interface ArtworkFilterContext {
  state: ArtworkFilterContextState
  dispatch: Dispatch<FilterActions>
}

export const ArtworkFilterContext = createContext<ArtworkFilterContext>(null)

export const ArtworkFilterGlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer<Reducer<ArtworkFilterContextState, FilterActions>>(
    (artworkFilterState, action) => {
      switch (action.type) {
        case "applyFilters":
          const previouslyAppliedFilters = artworkFilterState.appliedFilters
          const filtersToApply = action.payload
          const appliedFilters = union(previouslyAppliedFilters, filtersToApply)
          return { appliedFilters, selectedFilters: [], selectedSortOption: artworkFilterState.selectedSortOption }
        case "selectFilters":
          const previouslySelectedFilters = artworkFilterState.selectedFilters
          const currentlySelectedFilter = action.payload
          const isFilterAlreadySelected = previouslySelectedFilters.includes(currentlySelectedFilter)
          const selectedFilter = []
          if (isFilterAlreadySelected) {
            const mergedFilters = previouslySelectedFilters.push(currentlySelectedFilter)
            return {
              selectedFilters: mergedFilters,
              appliedFilters: filterState.appliedFilters,
              selectedSortOption: currentlySelectedFilter,
            }
          } else {
            selectedFilter.push(currentlySelectedFilter)
            return {
              selectedFilters: selectedFilter,
              appliedFilters: filterState.appliedFilters,
              selectedSortOption: currentlySelectedFilter,
            }
          }
        case "resetFilters":
          return { appliedFilters: [], selectedFilters: [], selectedSortOption: "Default" }
      }
    },
    filterState
  )

  return <ArtworkFilterContext.Provider value={{ state, dispatch }}>{children}</ArtworkFilterContext.Provider>
}
