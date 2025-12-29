export const generateAnswer = (): number[] => {
  const numbers = Array.from({ length: 13 }, (_, i) => i + 1)
  const answer: number[] = []

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length)
    answer.push(numbers[randomIndex])
    numbers.splice(randomIndex, 1)
  }

  return answer
}

export const calculateHitAndBlow = (
  answer: number[],
  guess: number[]
): { hit: number; blow: number } => {
  let hit = 0
  let blow = 0

  guess.forEach((num, index) => {
    if (num === answer[index]) {
      hit++
    } else if (answer.includes(num)) {
      blow++
    }
  })

  return { hit, blow }
}

export const generateRandomGuess = (): number[] => {
  return generateAnswer()
}
