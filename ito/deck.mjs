// Called again by Firebase whenever another player changes the deck.
// Never create a session here: disconnect cleanup must win over queued draws.
export function drawNumber(players, sessionId, random = Math.random) {
  if (!players || !Object.hasOwn(players, sessionId)) return;
  const used = new Set(Object.values(players).map(player => player.number));
  const available = Array.from({length: 100}, (_, i) => i + 1)
    .filter(number => !used.has(number));
  if (!available.length) return;
  const number = available[Math.floor(random() * available.length)];
  return {...players, [sessionId]: {number}};
}
