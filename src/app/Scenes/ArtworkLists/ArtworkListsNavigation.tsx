import { Box, Button, Flex } from "@artsy/palette-mobile"
import {
  NavigationContainer,
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native"
import { TransitionPresets, createStackNavigator } from "@react-navigation/stack"
import { FancyModalHeader } from "app/Components/FancyModal/FancyModalHeader"
import {
  CreateNewListForm,
  CreateResult,
} from "app/Scenes/ArtworkLists/components/CreateNewListForm"
import {
  RecentlyCreatedArtworkList,
  RecentlyCreatedArtworkListEntity,
} from "app/Scenes/ArtworkLists/components/RecentlyCreatedArtworkList"
import { ScrollableArtworkLists } from "app/Scenes/ArtworkLists/components/ScrollableArtworkLists"
import { FC } from "react"

type ArtworkListsNavigationProps = {
  onClose: () => void
}

type ArtworkListsNavigationStack = {
  SelectListsForArtwork: {
    list?: RecentlyCreatedArtworkListEntity
    onClose: () => void
  }
  CreateNewList: undefined
}

const StackNavigator = createStackNavigator<ArtworkListsNavigationStack>()

export const ArtworkListsNavigation: FC<ArtworkListsNavigationProps> = ({ onClose }) => {
  return (
    <NavigationContainer independent>
      <StackNavigator.Navigator
        /**
         * *** Please pay attention ***
         *
         * force it to not use react-native-screens, which is broken inside a react-native Modal for some reason
         * otherwise the camera will be "frozen" and it will be *impossible* to take a photo
         */
        detachInactiveScreens={false}
        screenOptions={{
          ...TransitionPresets.DefaultTransition,
          headerShown: false,
          headerMode: "screen",
        }}
      >
        <StackNavigator.Screen
          name="SelectListsForArtwork"
          initialParams={{ onClose }}
          component={SelectListsForArtwork}
        />
        <StackNavigator.Screen name="CreateNewList" component={CreateNewList} />
      </StackNavigator.Navigator>
    </NavigationContainer>
  )
}

const SelectListsForArtwork = () => {
  const navigation = useNavigation<NavigationProp<ArtworkListsNavigationStack>>()
  const route = useRoute<RouteProp<ArtworkListsNavigationStack, "SelectListsForArtwork">>()

  const handleCreateListPressed = () => {
    navigation.navigate("CreateNewList")
  }

  return (
    <Flex flex={1}>
      <FancyModalHeader onLeftButtonPress={route.params?.onClose} useXButton>
        Select lists for this artwork
      </FancyModalHeader>

      {!!route.params?.list && <RecentlyCreatedArtworkList artworkList={route.params.list} />}

      <Box m={2}>
        <Button block width="100%" onPress={handleCreateListPressed}>
          Create New List
        </Button>
      </Box>

      <ScrollableArtworkLists />
    </Flex>
  )
}

const CreateNewList = () => {
  const navigation = useNavigation<NavigationProp<ArtworkListsNavigationStack>>()

  const handleBackPressed = () => {
    navigation.goBack()
  }

  const handleCreateListPressed = ({ name }: CreateResult) => {
    // @ts-ignore
    navigation.navigate("SelectListsForArtwork", {
      list: {
        name,
      },
    })
  }

  return (
    <CreateNewListForm onCreatePress={handleCreateListPressed} onBackPress={handleBackPressed} />
  )
}
