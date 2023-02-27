import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack"
import { ArtQuizNavigationQuery } from "__generated__/ArtQuizNavigationQuery.graphql"
import { ArtQuizArtworks } from "app/Scenes/ArtQuiz/ArtQuizArtworks"
import { ArtQuizLoader } from "app/Scenes/ArtQuiz/ArtQuizLoader"
import { ArtQuizResults } from "app/Scenes/ArtQuiz/ArtQuizResults/ArtQuizResults"
import { ArtQuizWelcome } from "app/Scenes/ArtQuiz/ArtQuizWelcome"
import { Suspense } from "react"
import { graphql, useLazyLoadQuery } from "react-relay"

export type ArtQuizNavigationStack = {
  ArtQuizWelcome: undefined
  ArtQuizArtworks: undefined
  ArtQuizResults: { isCalculatingResult?: boolean }
}

export const StackNavigator = createStackNavigator<ArtQuizNavigationStack>()

const ArtQuiz: React.FC = () => {
  const quizCompleted = useLazyLoadQuery<ArtQuizNavigationQuery>(artQuizNavigationQuery, {}).me
    ?.quiz.completedAt

  if (quizCompleted) {
    return <ArtQuizResults />
  }

  return (
    <NavigationContainer independent>
      <StackNavigator.Navigator
        screenOptions={{
          ...TransitionPresets.DefaultTransition,
          headerShown: false,
          headerMode: "screen",
          gestureEnabled: false,
        }}
      >
        <StackNavigator.Screen name="ArtQuizWelcome" component={ArtQuizWelcome} />
        <StackNavigator.Screen name="ArtQuizArtworks" component={ArtQuizArtworks} />
        <StackNavigator.Screen name="ArtQuizResults" component={ArtQuizResults} />
      </StackNavigator.Navigator>
    </NavigationContainer>
  )
}

export const ArtQuizNavigation = () => {
  return (
    <Suspense fallback={<ArtQuizLoader />}>
      <ArtQuiz />
    </Suspense>
  )
}

const artQuizNavigationQuery = graphql`
  query ArtQuizNavigationQuery {
    me {
      quiz {
        completedAt
      }
    }
  }
`