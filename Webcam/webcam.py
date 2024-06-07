import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
from torchvision import transforms
from PIL import Image
from ultralytics import YOLO
import sys

if  len(sys.argv) < 2:
    print(f'Please provide model name [resnet,yolo] as an argument Example: python webcam.py resnet')
    sys.exit(1)
model = sys.argv[1]

if model not in ['resnet','yolo']:
    print(f'Invalid model name {model}. Possible models are [resnet,yolo]')
    sys.exit(1)

idx_to_class_resnet50 = {0 : "Genuine" , 1:'Printed Paper' , 2 : 'Replayed'}
idx_to_class_yolo9 = {0: 'genuine_person', 1: 'still_printed_paper', 2: 'quivering_printed_paper', 3: 'lenovo_LCD_display', 4: 'Mac_LCD_display', 5: 'paper_mask'}

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
print('Model Loaded Successfully')

def predict(image):
    if model == 'resnet':
        transform_img = transform_data_resnet50(image).unsqueeze(0)
        with torch.no_grad():
            pred = model_resnet50(transform_img)
            probabilities = F.softmax(pred[0], dim=0)
            cat = torch.argmax(pred[0]).item()
            prob = round((probabilities[cat] * 100).item(), 2)
            name = idx_to_class_resnet50[cat]
    elif model=='yolo':
        results = model_yolo9(image)
        name = 'not detectable'
        prob = 0.00
        for result in results[0].boxes:
            cls = int(result.cls.item())
            name = idx_to_class_yolo9[cls]
            prob = round(result.conf.item() * 100,2)
    else :
        name = 'not detectable'
        prob = 0.00
    return name, prob


cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    
    name, prob = predict(pil_img)
    
    cv2.putText(frame, f'{name}: {prob}%', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
    
    cv2.imshow('Webcam Prediction', frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()