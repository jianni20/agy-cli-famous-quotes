from flask import Flask
import os


def create_app():
    app = Flask(
        __name__,
        static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static'),
        static_url_path=''
    )

    from .routes import bp
    app.register_blueprint(bp)

    return app
