from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import matplotlib.pyplot as plt
import base64
import io
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
from PIL import Image
from torchvision import transforms
from ultralytics import YOLO


from PIL import Image
app = Flask(__name__)
CORS(app)


idx_to_class_resnet50 = {0 : "Genuine" , 1:'Printed Paper' , 2 : 'Replayed'}
idx_to_class_yolo9 = idx_to_class_yolo9 = {0: 'Genuine', 1: 'Printed Paper', 2: 'Replayed', 3: 'Paper Mask'}
transform_data_resnet50=transforms.Compose([
    transforms.Resize(size=(224,224)),
    # transforms.RandomHorizontalFlip(p=0.5),
    transforms.ToTensor()
])

model_resnet50 = models.resnet50(weights=False)
num_classes = 3 
model_resnet50.fc = nn.Linear(model_resnet50.fc.in_features, num_classes)
model_resnet50.load_state_dict(torch.load('resnet50_pytorch_rose_weights.pth',map_location=torch.device('cpu')))
model_resnet50.eval()

model_yolo9 = YOLO('yolo9_best.pt')
print('Models Loaded Successfully')

@app.route('/')
def home():
    return "Welcome to the Flask API!"


@app.route('/api/data', methods=['GET'])
def get_data():
    img = plt.imread('test1.jpeg')
    img_arr = np.array(img)
    pil_img = Image.fromarray(img_arr.astype(np.uint8))  
    buffered = io.BytesIO()
    pil_img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    data = {
        'message': 'Hello, World!',
        'items': [1, 2, 3, 4, 5],
        'image': img_str
    }
    return jsonify(data)

@app.route('/api/data', methods=['POST'])
def post_data():
    data = request.json
    base64_image = data['imageData']
    filename = data.get('filename', 'image.jpg')
    image_data = base64.b64decode(base64_image)
    image = Image.open(io.BytesIO(image_data)).convert('RGB')
    image.save(filename)
    if data['model']=='resnet':
        transform_img = transform_data_resnet50(image).unsqueeze(0)
        with torch.no_grad():
            pred = model_resnet50(transform_img)
            probabilities = F.softmax(pred[0], dim=0)
            cat = torch.argmax(pred[0]).item()
            prob = round((probabilities[cat] * 100).item(),2)
            name = idx_to_class_resnet50[cat]
    else:
        results = model_yolo9(image)
        name = 'not detectable'
        prob = 0.00
        for result in results[0].boxes:
            cls = int(result.cls.item())
            name = idx_to_class_yolo9[cls]
            prob = round(result.conf.item() * 100,2)
    
    response = {
        'message': 'Data received!',
        'your_base64': data['imageData'],
        'class' : name,
        'prob' : prob
    }
    return jsonify(response), 201

if __name__ == '__main__':
    app.run(debug=True,port = 5000)
