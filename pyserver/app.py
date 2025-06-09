from flask import Flask, request, jsonify
import os
import pickle
from feature_extractor_resnet import FeatureExtractor
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
extractor = FeatureExtractor()

try:
    with open('features.pkl', 'rb') as f:
        features_dict = pickle.load(f)

    with open('similarity_index.pkl', 'rb') as f:
        index_data = pickle.load(f)
        nbrs = index_data['nbrs']
        filenames = index_data['filenames']
        
    # Verify the data was loaded correctly
    if not isinstance(filenames, list) or len(filenames) == 0:
        raise ValueError("No filenames loaded from index")
    if not hasattr(nbrs, 'kneighbors'):
        raise ValueError("Invalid nearest neighbors model")
        
    print(f"Loaded {len(filenames)} image features and similarity index")
except Exception as e:
    print(f"Error loading precomputed data: {str(e)}")
    raise

DATASET_PATH = "./saved_images"

@app.route('/api/search', methods=['POST'])
def search_similar_images():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Validate file extension
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({'error': 'Invalid file type. Only images are allowed.'}), 400
    
    # Save uploaded file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, secure_filename(file.filename))
    file.save(temp_path)
    
    try:
        # Extract features from uploaded image
        query_features = extractor.extract_features(temp_path)
        
        # Find similar images - return 5 most similar (including the query if it exists in dataset)
        distances, indices = nbrs.kneighbors([query_features], n_neighbors=min(51, len(filenames)))
        
        # Get similar image paths
        similar_images = []
        for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
            if i == 0:
                continue  # Skip the first result which might be the query image itself
            
            if idx >= len(filenames):
                print(f"Warning: Invalid index {idx} for filenames array (size {len(filenames)})")
                continue
                
            img_path = filenames[idx]
            full_path = os.path.join(DATASET_PATH, img_path)
            
            if not os.path.exists(full_path):
                print(f"Warning: Image file not found at {full_path}")
                continue
                
            similar_images.append({
                'path': img_path,
                'filename': os.path.basename(img_path),
                'distance': float(distance)
            })
        
        # Sort by distance (ascending)
        similar_images.sort(key=lambda x: x['distance'])
        if not similar_images:
            return jsonify({'error': 'No similar images found'}), 404
        list_of_ids = [os.path.splitext(os.path.basename(img['path']))[0] for img in similar_images]
        return jsonify({
            'similar_images': list_of_ids,
            'count': len(list_of_ids)
        })
    
    except Exception as e:
        print(f"Error during similarity search: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Clean up temporary file
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            os.rmdir(temp_dir)
        except Exception as e:
            print(f"Warning: Error cleaning up temp files: {str(e)}")

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)