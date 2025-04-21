import { Demon } from './demon.js';

let demon;

export function initCharacter(ctx, groundY) {
  demon = new Demon(ctx, groundY);
  return demon;
}

export function updateCharacter(deltaTime) {
  if (demon) demon.update(deltaTime);
}

export function drawCharacter() {
  if (demon) demon.draw();
}

export function handleJump() {
  if (demon) demon.jump();
}

export function handleSlide() {
  if (demon) demon.slide();
}

export function handleAttack() {
  if (demon) demon.attack();
}

export function killCharacter() {
  if (demon) demon.die();
}

export function resetCharacter(ctx, groundY) {
  demon = new Demon(ctx, groundY);
}

export function getCharacter() {
  return demon;
}
