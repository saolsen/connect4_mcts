export type Player = {
    kind: "user" | "agent";
    username: string;
    agentname?: string;
    game?: string;
}

export type Action = {
    column: number;
}

export type Turn = {
    number: number;
    player: number | null;
    action: Action | null;
}

export type Status = {
    state: "in_progress" | "over";
    next_player?: number;
    winner?: number | null;
}

export type State = {
    board: (number | null)[];
}

export type Match = {
    id: number;
    game: "connect4";
    players: Player[];
    turns: Turn[];
    turn: number;
    status: Status,
    state: State;
}

export const exampleMatch: Match = JSON.parse('{"id":123,"game":"connect4","players":[{"kind":"user","username":"user1"},{"kind":"agent","game":"connect4","username":"user2","agentname":"agent1"}],"turns":[{"number":0,"player":null,"action":null},{"number":1,"player":0,"action":{"column":0}}],"turn":0,"status":{"state":"in_progress","next_player":1},"state":{"board":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}}')

// Our compact representation of a game
type Game = {
    player: number;
    board: Int8Array;
}

export const ourGame: Game = {
    player: 1,
    board: new Int8Array(42),
}

export function parse(match: Match): Game {
    let board = new Int8Array(42);
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 6; row++) {
            let piece = match.state.board[col * 6 + row];
            if (piece === 0) {
                board[col * 6 + row] = 1;
            } else if (piece === 1) {
                board[col * 6 + row] = 2;
            }
        }
    }
    return {
        // instead of 0 and 1, we use 1 and 2.
        // This is because we use 0 for empty instead of null.
        player: match.status.next_player! + 1,
        board: board,
    }
}

export function rand_col(game: Game): number {
    let col = Math.floor(Math.random() * 7);
    while (game.board[col * 6 + 5] != 0) {
        col = Math.floor(Math.random() * 7);
    }
    return col;
}

export function turn(game: Game, col: number) {
    let row = 0;
    while (game.board[col * 6 + row] != 0) {
        row++;
    }
    game.board[col * 6 + row] = game.player;
    game.player = 3 - game.player;
}

export function rand_turn(game: Game): number {
    let col = rand_col(game);
    turn(game, col);
    return col;
}

export function check(game: Game): number {
    // Check for horizontal wins
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
            let piece = game.board[col * 6 + row];
            if (piece != 0
                && piece == game.board[(col + 1) * 6 + row]
                && piece == game.board[(col + 2) * 6 + row]
                && piece == game.board[(col + 3) * 6 + row]) {
                return piece;
            }
        }
    }

    // Check for vertical wins
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 3; row++) {
            let piece = game.board[col * 6 + row];
            if (piece != 0
                && piece == game.board[col * 6 + row + 1]
                && piece == game.board[col * 6 + row + 2]
                && piece == game.board[col * 6 + row + 3]) {
                return piece;
            }
        }
    }

    // Check for diagonal wins
    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 3; row++) {
            let piece = game.board[col * 6 + row];
            if (piece != 0
                && piece == game.board[(col + 1) * 6 + row + 1]
                && piece == game.board[(col + 2) * 6 + row + 2]
                && piece == game.board[(col + 3) * 6 + row + 3]) {
                return piece;
            }
        }
    }

    // Check for diagonal wins
    for (let col = 0; col < 4; col++) {
        for (let row = 3; row < 6; row++) {
            let piece = game.board[col * 6 + row];
            if (piece != 0
                && piece == game.board[(col + 1) * 6 + row - 1]
                && piece == game.board[(col + 2) * 6 + row - 2]
                && piece == game.board[(col + 3) * 6 + row - 3]) {
                return piece;
            }
        }
    }

    // Check for a tie
    for (let col = 0; col < 7; col++) {
        if (game.board[col * 6 + 5] == 0) {
            return 0;
        }
    }
    return 3;
}

export function run(game: Game): number {
    let winner = check(game);
    while (winner == 0) {
        rand_turn(game);
        winner = check(game);
    }
    return winner;
}

export function mcts(game: Game): number {
    let actions = [];
    for (let col = 0; col < 7; col++) {
        if (game.board[col * 6 + 5] == 0) {
            actions.push(col);
        }
    }

    let scores = new Float32Array(7);
    for (let i = 0; i < 7; i++) {
        scores[i] = -1;
    }
    for (let action of actions) {
        let wins = 0;
        let losses = 0;
        let draws = 0;

        for (let i = 0; i < 10000; i++) {
            const player = game.player;
            let new_game = {
                player: game.player,
                board: game.board.slice(),
            }
            turn(new_game, action)
            const winner = run(new_game);
            if (winner == 3) {
                draws++;
            } else if (winner == player) {
                wins++;
            } else {
                losses++;
            }
        }

        scores[action] = (wins - losses) / (wins + losses + draws);
    }

    let best_score = -1;
    let best_action = -1;
    for (let i = 0; i < 7; i++) {
        if (scores[i] > best_score) {
            best_score = scores[i];
            best_action = i;
        }
    }
    return best_action;
}