/**
 * Created by vishal on 9/9/17.
 */

var human, ai, status_message, board, board_active, board_block, win_condition, messages, player_to_symbol, ORIGINAL_VALUE_KEY, loading;

$(document).ready(function () {
    init_variables();
    populate_messages('start');
    bind_event_listeners();
});

var init_variables = function () {
    human = $('#human');
    ai = $('#ai');
    status_message = $('#status_message');
    board = $('#tictac_board');
    board_block = $('#tictac_board > tbody > tr > td');
    messages = {
        'start': ['You start.', 'I start.', 'Who starts?', false],    //human, ai, status_message, board_active
        'ai_turn': ['You restart.', 'I restart.', 'My turn.', false],
        'human_turn': ['You restart.', 'I restart.', 'Your turn.', true],
        'human_win': ['You restart.', 'I restart.', 'You win.', false],  //Should never be called.
        'ai_win': ['You restart.', 'I restart.', 'I win.', false],
        'draw': ['You restart.', 'I restart.', "It's a draw.", false]
    };
    player_to_symbol = {'2': ''};
    ORIGINAL_VALUE_KEY = 'original_value';
    loading = $('#loading');
    win_condition = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    reset_board();
};

var populate_messages = function (stage) {    //Populate messages, make board clickable/non-clickable based on stage.
    human.text(messages[stage][0]);
    ai.text(messages[stage][1]);
    status_message.text(messages[stage][2]);
    board_active = messages[stage][3];
};

var is_board_block_empty = function (element) {
    return element.data(ORIGINAL_VALUE_KEY) == '2';
};

var bind_event_listeners = function () {
    board_block.on('mouseover', function () {
        var current_element = $(this);
        if(board_active && is_board_block_empty(current_element))    {
            current_element.css('cursor', 'pointer');
            current_element.text(player_to_symbol['0']);    //Place O/X based on whether human starts or AI.
            current_element.css('opacity', 0.6);
        }
    });

    board_block.on('mouseout', function()  {
        var current_element = $(this);
        if(board_active && is_board_block_empty(current_element))    {
            var original_symbol = current_element.data(ORIGINAL_VALUE_KEY);
            current_element.text(player_to_symbol[original_symbol]);
            current_element.css('opacity', 0.9);
        }
    });

    board_block.on('click', function () {
        var current_element = $(this);
        if(board_active && is_board_block_empty(current_element))    {
            current_element.css('opacity', 0.9);
            current_element.data(ORIGINAL_VALUE_KEY, '0');
            if(!reached_end_state())    {
                populate_messages('ai_turn');
                perform_ai_move();
            }
        }
    });

    human.on('click', function () {
        populate_messages('human_turn');
        player_to_symbol['0'] = 'O';    //Human player will take first turn.
        player_to_symbol['1'] = 'X';
        reset_board();
    });

    ai.on('click', function () {
        populate_messages('ai_turn');
        player_to_symbol['0'] = 'X';    //AI player will take first turn.
        player_to_symbol['1'] = 'O';
        reset_board();
        perform_ai_move();
    });
};

var reset_board = function () {
    board_block.text('');
    board_block.data(ORIGINAL_VALUE_KEY, '2');    //2 implies empty board_block.
    board_block.css('color', 'black');
};

var get_board_state = function () {
    var state = [];
    for(var i = 0; i < 9; i++) {
        var val = $(board_block.get(i)).data(ORIGINAL_VALUE_KEY);
        state.push(val);
    }
    return state;
};

var perform_ai_move = function () {
    status_message.hide();
    loading.show();
    $.ajax({
      url: '/ai_move',
      type: 'GET',
      async: false,
      datatype: 'json',
      data: {'board_state': get_board_state()},
      success:  function(response) {
          perform_ai_move_actions(response);
      },
      complete: function () {
          loading.hide();
          status_message.show();
      }
    });
};

var perform_ai_move_actions = function(response)    {
    var next_move = $.parseJSON(response);
    var next_move_index = parseInt(next_move.move);
    var move_block = $(board_block.get(next_move_index));
    move_block.data(ORIGINAL_VALUE_KEY, '1');
    move_block.text(player_to_symbol['1']);
    if(!reached_end_state())    {
        populate_messages('human_turn');
    }
};

var reached_end_state = function()  {
    var board_is_full = true;
    for(var i = 0; i < 8; i++)  {
        var block_one = $(board_block.get(win_condition[i][0]));
        var block_two = $(board_block.get(win_condition[i][1]));
        var block_three = $(board_block.get(win_condition[i][2]));
        var one = block_one.data(ORIGINAL_VALUE_KEY);
        var two = block_two.data(ORIGINAL_VALUE_KEY);
        var three = block_three.data(ORIGINAL_VALUE_KEY);

        if(one == '2' || two == '2' || three == '2') {
            board_is_full = false;
            continue;
        }

        if(one == two && two == three) {
            highlight_win_blocks(block_one, block_two, block_three);
            if (one == '1') {
                populate_messages('ai_win');
                return true;
            } else if (one == '0') {
                console.log('human win true');
                populate_messages('human_win');
                return true;
            }
        }
    }

    if(board_is_full)   {
        populate_messages('draw');
        return true;
    }

    return false;
};

var highlight_win_blocks = function (one, two, three) {
    for(var i = 0; i < 3; i++)  {
        arguments[i].css('opacity', 1);
        arguments[i].css('color', '#c6443f');
    }
};