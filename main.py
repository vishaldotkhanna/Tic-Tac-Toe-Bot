from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application

import os
import json
from tictac import minimax, alpha_beta, time_minimax

BOARD_STATE_KEY = 'board_state[]'


class TicTacHandler(RequestHandler):
    def get(self):
        self.render('tictac.html')


class AIMoveHandler(RequestHandler):
    @time_minimax
    def get(self):
        board_state = ''.join([elem.encode('utf8') for elem in self.get_arguments(BOARD_STATE_KEY)])
        # next_move = minimax(board_state)
        next_move = alpha_beta(board_state)
        self.write(json.dumps(next_move))


def main():
    settings = {
                'template_path': os.path.join(os.path.dirname(__file__), 'templates'),
                'static_path': os.path.join(os.path.dirname(__file__), 'static'),
                'debug': True
    }

    app = Application([
                    (r'/tictac', TicTacHandler),
                    (r'/ai_move', AIMoveHandler)
    ], **settings)

    app.listen(8885)
    IOLoop.instance().start()

if __name__ == '__main__':
    main()