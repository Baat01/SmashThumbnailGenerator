import { fetchEventSets } from './src/api/startgg.js';

const apiKey = '83c014432d1bd95a90e97b43b3a99a15';
// Event ID for "Final bracket" of "Let's go LANbling" -> Let's find out by first fetching events.
import { fetchTournamentEvents } from './src/api/startgg.js';

async function runTest() {
  console.log('--- TEST 1: AUTO DETECT CHARACTERS FROM API ---');
  // I will test with a known tournament slug the user provided: 'sinj-en-cup-1'
  const slug = 'sinj-en-cup-1';
  console.log(`Fetching events for tournament: ${slug}`);
  const events = await fetchTournamentEvents(apiKey, slug);
  if (events.length === 0) {
    console.log('No events found.');
    return;
  }
  
  const event = events[0]; // Take first event
  console.log(`Fetching sets for event: ${event.name} (ID: ${event.id})`);
  const sets = await fetchEventSets(apiKey, event.id, event.name);
  
  if (sets.length === 0) {
    console.log('No completed sets found.');
    return;
  }
  
  const firstSet = sets[0];
  console.log(`\nTest Set: ${firstSet.fullRoundText}`);
  console.log('RAW GAMES:', JSON.stringify(firstSet.games, null, 2));

  firstSet.slots.forEach((slot, i) => {
    const entrant = slot.entrant?.name || `Player ${i+1}`;
    const detectedChar = slot.detectedCharacter;
    console.log(`- ${entrant} : ${detectedChar ? detectedChar.name : 'No character detected (not selected in Start.gg)'}`);
  });
  
  console.log('\n--- ALL TESTS DONE ---');
  console.log('Please check the canvas rendering visually in the browser!');
}

runTest().catch(console.error);
