// Mock implementation of audio hooks
export function useGameSounds() {
  return {
    playTestComplete: () => console.log('Playing test complete sound'),
    playAchievement: () => console.log('Playing achievement sound'),
    playBackgroundMusic: (track: string) => console.log(`Playing background music: ${track}`),
    playComponentSelect: () => console.log('Playing component select sound'),
    playComponentPlace: () => console.log('Playing component place sound')
  };
}

export function useUISounds() {
  return {
    playTabSwitch: () => console.log('Playing tab switch sound'),
    playSave: () => console.log('Playing save sound'),
    playClick: () => console.log('Playing click sound'),
    playHover: () => console.log('Playing hover sound')
  };
}
