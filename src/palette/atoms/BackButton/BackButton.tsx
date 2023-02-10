import { ChevronIcon, CloseIcon } from "@artsy/palette-mobile"
import { GlobalStore } from "app/store/GlobalStore"
import { Color, Flex } from "palette"
import { TouchableOpacity, TouchableOpacityProps } from "react-native"

interface BackButtonProps {
  onPress?: () => void
  showX?: boolean
  color?: Color
  containerStyle?: TouchableOpacityProps["style"]
  hitSlop?: TouchableOpacityProps["hitSlop"]
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  showX = false,
  color = "black100",
  containerStyle,
  hitSlop,
}) => {
  const handleOnBackPress = () => {
    GlobalStore.actions.pageable.resetPageableSlugs()
    onPress?.()
  }

  return (
    <TouchableOpacity
      hitSlop={hitSlop}
      style={containerStyle}
      onPress={handleOnBackPress}
      accessibilityRole="button"
      accessibilityLabel={showX ? "Close" : "Go back"}
      accessibilityHint={showX ? "Dismiss this screen" : "Go back to the previous screen"}
    >
      {showX ? (
        <CloseIcon fill={color} width={26} height={26} />
      ) : (
        <ChevronIcon direction="left" fill={color} />
      )}
    </TouchableOpacity>
  )
}

export const BackButtonWithBackground: React.FC<BackButtonProps> = ({ onPress, showX = false }) => {
  const handleOnBackPress = () => {
    GlobalStore.actions.pageable.resetPageableSlugs()
    onPress?.()
  }

  return (
    <TouchableOpacity
      onPress={handleOnBackPress}
      accessibilityRole="button"
      accessibilityLabel={showX ? "Close" : "Go back"}
      accessibilityHint={showX ? "Dismiss this screen" : "Go back to the previous screen"}
    >
      <Flex
        backgroundColor="white100"
        width={40}
        height={40}
        borderRadius={20}
        alignItems="center"
        justifyContent="center"
      >
        {showX ? (
          <CloseIcon fill="black100" width={26} height={26} />
        ) : (
          <ChevronIcon direction="left" />
        )}
      </Flex>
    </TouchableOpacity>
  )
}
