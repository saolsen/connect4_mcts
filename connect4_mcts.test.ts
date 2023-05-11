import { expect, test } from "bun:test";
import { exampleMatch, parse, rand_turn, run, mcts } from "./connect4_mcts";

test("rand_turn", () => {
    let game = parse(exampleMatch);
    //console.log(game);
    let turn = rand_turn(game);
    //console.log(turn);
    //console.log(game);
});

test("2 + 2", () => {
    expect(3 + 2).toBe(5);
});

test("rand_game", () => {
    let game = parse(exampleMatch);
    let winner = run(game);
});

test("mcts", () => {
    let game = parse(exampleMatch);
    let move = mcts(game);
    console.log(move);
});