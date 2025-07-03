import { customAlphabet } from 'nanoid'
// 1️⃣ pick your alphabet (e.g. alphanumerics minus confusing letters)
// 2️⃣ make 3 factories for each segment length
const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const make3   = customAlphabet(alpha, 3)
const make4   = customAlphabet(alpha, 4)

// generate one id
export function generateRoomId() {
  return `${make3()}-${make4()}-${make3()}`
}

// examples:
//   "X7K-9QPD-NB3"
//   "J3M-4TZR-W8D"
