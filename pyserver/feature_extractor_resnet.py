import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
import pickle
from tqdm import tqdm
from sklearn.neighbors import NearestNeighbors
import matplotlib.pyplot as plt

class FeatureExtractor:
    def __init__(self):
        # Load pre-trained ResNet50 model without the top layer
        self.model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
    
    def extract_features(self, img_path):
        # Load and preprocess image
        img = image.load_img(img_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        
        # Extract features
        features = self.model.predict(x, verbose=0)
        return features.flatten()
    
    def process_dataset(self, dataset_path, output_file='features.pkl'):
        # Get all image paths
        image_paths = []
        for root, _, files in os.walk(dataset_path):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    relative_path = os.path.relpath(os.path.join(root, file), dataset_path)
                    image_paths.append(relative_path)
        
        # Extract features for all images
        features_dict = {}
        for img_path in tqdm(image_paths, desc="Processing images"):
            try:
                full_path = os.path.join(dataset_path, img_path)
                features = self.extract_features(full_path)
                features_dict[img_path] = features
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
        
        # Save features to file
        with open(output_file, 'wb') as f:
            pickle.dump(features_dict, f)
        
        print(f"Features saved to {output_file}")
        return features_dict

    def build_similarity_index(self, features_dict, n_neighbors=5):
        """Build a nearest neighbors index for similarity search"""
        filenames = list(features_dict.keys())
        feature_matrix = np.array(list(features_dict.values()))
        
        nbrs = NearestNeighbors(n_neighbors=n_neighbors, algorithm='auto', metric='cosine').fit(feature_matrix)
        
        return nbrs, filenames

if __name__ == "__main__":
    extractor = FeatureExtractor()
    dataset_path = "./saved_images"  # Change this to your dataset path
    features = extractor.process_dataset(dataset_path)
    
    # Build and save similarity index
    nbrs, filenames = extractor.build_similarity_index(features)
    with open('similarity_index.pkl', 'wb') as f:
        pickle.dump({'nbrs': nbrs, 'filenames': filenames}, f)
    print("Similarity index saved to similarity_index.pkl")