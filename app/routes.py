import json
import os
import random

from flask import Blueprint, current_app, jsonify, request, send_from_directory

bp = Blueprint('api', __name__)

_quotes = None


def load_quotes():
    """Load quotes from the JSON file, caching them in memory."""
    global _quotes
    if _quotes is None:
        quotes_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'quotes.json')
        with open(quotes_path, 'r', encoding='utf-8') as f:
            _quotes = json.load(f)
    return _quotes


@bp.route('/')
def index():
    """Serve the main HTML page."""
    return send_from_directory(current_app.static_folder, 'index.html')


@bp.route('/api/quote', methods=['GET'])
def get_quote():
    """Return a single random quote, optionally filtered by author and/or category."""
    quotes = load_quotes()
    author = request.args.get('author', '').strip()
    category = request.args.get('category', '').strip()

    filtered = quotes

    if author:
        filtered = [q for q in filtered if author.lower() in q['author'].lower()]

    if category:
        filtered = [
            q for q in filtered
            if any(category.lower() in c.lower() for c in q['categories'])
        ]

    if not filtered:
        return jsonify({'error': 'No quotes match the criteria.'}), 404

    chosen = random.choice(filtered)
    return jsonify(chosen)


@bp.route('/api/authors', methods=['GET'])
def get_authors():
    """Return a sorted list of unique authors."""
    quotes = load_quotes()
    authors = sorted({q['author'] for q in quotes})
    return jsonify(authors)


@bp.route('/api/categories', methods=['GET'])
def get_categories():
    """Return a sorted list of unique categories."""
    quotes = load_quotes()
    categories = sorted({c for q in quotes for c in q['categories']})
    return jsonify(categories)
