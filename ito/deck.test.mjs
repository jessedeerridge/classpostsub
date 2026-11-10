import test from 'node:test';
import assert from 'node:assert/strict';
import {drawNumber} from './deck.mjs';

test('100 players receive unique integers; player 101 cannot draw', () => {
  let players = {};
  for (let i = 0; i < 100; i++) {
    const id = `player${i}`;
    players[id] = {number: 0};
    players = drawNumber(players, id);
  }
  const numbers = Object.values(players).map(player => player.number);
  assert.deepEqual([...numbers].sort((a, b) => a - b), Array.from({length: 100}, (_, i) => i + 1));
  players.extra = {number: 0};
  assert.equal(drawNumber(players, 'extra'), undefined);
  assert.equal(drawNumber(players, 'player0'), undefined);
});

test('redrawing changes the number and makes the old number available', () => {
  const original = {a: {number: 1}, b: {number: 2}};
  const changed = drawNumber(original, 'a', () => 0);
  assert.equal(changed.a.number, 3);
  assert.equal(changed.b.number, 2);
  assert.equal(original.a.number, 1);
  const next = drawNumber({...changed, c: {number: 0}}, 'c', () => 0);
  assert.equal(next.c.number, 1);
});

test('disconnect frees the number and pending draws cannot recreate a removed session', () => {
  const players = {a: {number: 42}, b: {number: 0}};
  delete players.a;
  assert.equal(drawNumber(players, 'a'), undefined);
  assert.equal(drawNumber(null, 'a'), undefined);
  assert.equal(drawNumber(players, 'b', () => 0.415).b.number, 42);
});

test('transaction retry selects a different number after a competing draw', () => {
  const players = {a: {number: 0}, b: {number: 0}};
  const firstAttempt = drawNumber(players, 'a', () => 0);
  const competingCommit = drawNumber(players, 'b', () => 0);
  const retried = drawNumber(competingCommit, 'a', () => 0);
  assert.equal(firstAttempt.a.number, 1);
  assert.equal(retried.b.number, 1);
  assert.equal(retried.a.number, 2);
});
