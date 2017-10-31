from time import time


def time_minimax(method):
    def wrapper(*args, **kwargs):
        before = time()
        value = method(*args, **kwargs)
        after = time()
        print 'Time taken: %.2f ms' % ((after - before) * 1000)
        return value

    return wrapper


def minimax(current_state, maximize=True):
    possible_moves = get_possible_moves(current_state)
    if len(possible_moves) == 1:
        next_move = possible_moves[0]
        next_state, next_state_score = get_next_state_and_score(current_state, next_move, player=int(maximize))
        return dict(move=next_move, score=next_state_score)

    max_move = dict(move=-1, score=-2)
    min_move = dict(move=-1, score=2)
    for move in possible_moves:
        next_state, next_state_score = get_next_state_and_score(current_state, move, player=int(maximize))
        if next_state_score == win_score[int(maximize)]:
            return dict(move=move, score=next_state_score)
        next_move = minimax(next_state, not maximize)
        if next_move['score'] > max_move['score']:
            max_move['score'] = next_move['score']    # Only score needs to be backtracked across recursive calls, not the move.
            max_move['move'] = move
        if next_move['score'] < min_move['score']:
            min_move['score'] = next_move['score']
            min_move['move'] = move

    return max_move if maximize else min_move


def alpha_beta(current_state, maximize=True, alpha=-10, beta=10):
    possible_moves = get_possible_moves(current_state)
    choices = len(possible_moves)
    if choices == 1:
        next_move = possible_moves[0]
        next_state, next_state_score = get_next_state_and_score(current_state, next_move, player=int(maximize))
        return dict(move=next_move, score=next_state_score)

    max_move = dict(move=-1, score=-10)
    min_move = dict(move=-1, score=10)
    for move in possible_moves:
        next_state, next_state_score = get_next_state_and_score(current_state, move, player=int(maximize))
        if next_state_score == win_score[int(maximize)]:
            return dict(move=move, score=choices * next_state_score)

        next_move = alpha_beta(next_state, not maximize, alpha, beta)
        if update_values_for_move(move, next_move, max_move, min_move, alpha, beta, maximize):
            break

    return inc_or_dec_score(max_move, choices) if maximize else inc_or_dec_score(min_move, choices)


def update_values_for_move(current_move, next_move, max_move, min_move, alpha, beta, maximize):
    if maximize and next_move['score'] > max_move['score']:
        max_move['score'] = next_move['score']
        max_move['move'] = current_move
        alpha = max(alpha, max_move['score'])
    elif not maximize and next_move['score'] < min_move['score']:
        min_move['score'] = next_move['score']
        min_move['move'] = current_move
        beta = min(beta, min_move['score'])

    return beta <= alpha


def inc_or_dec_score(move, choices):
    move['score'] = move['score'] / (choices - 1) * choices
    return move


def get_possible_moves(state):
    return [index for index, element in enumerate(state) if element == '2']


score_dict = {'1': 1,   # Assuming AI is always player 1. maximize = True for player 1.
              '0': -1}

win_conditions = ((0, 1, 2), (3, 4, 5), (6, 7, 8),
                   (0, 3, 6), (1, 4, 7), (2, 5, 8),
                   (0, 4, 8), (2, 4, 6))

win_score = (-1, 1)    # -1 for player 0(human), 1 for player 1(ai).


def get_state_score(state):
    for win_condition in win_conditions:
        if state[win_condition[0]] == '2':
            continue
        if state[win_condition[0]] == state[win_condition[1]] and state[win_condition[1]] == state[win_condition[2]]:
            return score_dict[state[win_condition[0]]]
    return 0


def get_next_state_and_score(state, next_move, player):    # Return state string after performing next_move.
    next_state = state[:next_move] + str(player) + state[next_move + 1:]
    return next_state, get_state_score(next_state)


if __name__ == '__main__':
    state = '010110202'    #'210220222'
    minimax(state, maximize=True)