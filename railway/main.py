from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Import scraper from local file
from scraper import scrape

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

@app.route('/scrape', methods=['POST'])
def scrape_endpoint():
    """Scrape scorecard from URL"""
    try:
        data = request.json
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'URL is required'
            }), 400
        
        url = data['url']
        
        # Run scraper
        result = scrape(url)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
