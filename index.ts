import { type Serve } from "bun";
import { parse, mcts, Match } from "./connect4_mcts";

export default {
    async fetch(req) {
        if (req.method != "POST") {
            return new Response("ok");
        }
        const match = await req.json();
        const game = parse(match as Match);
        const action = mcts(game);
        const response = `{"game":"connect4","column":${action}}`;
        console.log(response);

        return new Response(response);
    },
} satisfies Serve;