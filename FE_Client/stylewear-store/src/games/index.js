import JumpGame from "./jump/JumpGame";
import Flappy from "./flappy/flappy"; 

export const GAMES = [
  {
    id: "jump",
    name: "Jump Game",
    component: JumpGame,
  },
  {
    id: "flappy",
    name: "Flappy Bird",
    component: Flappy,
  },
];
