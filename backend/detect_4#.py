# import the necessary packages
import os
import random
import numpy as np
import cv2 as cv
import colorsys
import argparse
import imutils
import matplotlib.pyplot as plt
from mrcnn import utils

# detecting part
from mrcnn.config import Config
from mrcnn import model as modellib
from mrcnn import visualize

# 경로 설정
ROOT_DIR = os.path.abspath("./")
MODEL_DIR = os.path.join(ROOT_DIR, "logs")
COCO_MODEL_PATH = os.path.join(ROOT_DIR, "mask_rcnn_coco.h5")

# 검출해낼 수 있는 종류, 하나라도 없게되면 오류가 발생
class_names = ['BG', 'person', 'bicycle', 'car', 'motorcycle', 'airplane',
               'bus', 'train', 'truck', 'boat', 'traffic light',
               'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird',
               'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear',
               'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie',
               'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
               'kite', 'baseball bat', 'baseball glove', 'skateboard',
               'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
               'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
               'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza',
               'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed',
               'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
               'keyboard', 'cell phone', 'microwave', 'oven', 'toaster',
               'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors',
               'teddy bear', 'hair drier', 'toothbrush']

#generate random colors for each class label
#검출될 마스크에 씌워질 색상을 랜덤으로 생성하고 저장
hsv = [(i / len(class_names), 1, 1.0) for i in range (len(class_names))]
COLORS = list(map(lambda c: colorsys.hsv_to_rgb(*c), hsv))
random.seed(42)
random.shuffle(COLORS)

# config = MASKRCNN모델의 설정파일, 없다면 오류가 발생
class SimpleConfig(Config):
    NAME = "coco_inference"
    GPU_COUNT = 1
    IMAGES_PER_GPU = 1
    NUM_CLASSES = len(class_names)
config = SimpleConfig()
model = modellib.MaskRCNN(mode='inference', config=config
                          ,model_dir=os.getcwd())

# 학습된 검출모델 불러오기
model.load_weights(COCO_MODEL_PATH, by_name=True)


# 해당 폴더에서 특정 사진을 불러와서 읽어오기
filename = 'input/Shinjuku.jpg'
image = cv.imread(filename)
image = imutils.resize(image, height= 680, width = 512) # 해상도를 재조절
cv.imwrite("03raw.png", image) # 원본 이미지 파일을 png파일로 저장

# opencv는 기본적으로 BGR로 구성되는데 이미지 처리를 위해 RGB로 전환
image = cv.cvtColor(image, cv.COLOR_BGR2RGB)

h, w, c = image.shape # 이미지의 높이, 넓이, 채널을 가져옴

results= model.detect([image], verbose=1) # 검출 실행 부분
r = results[0] # 검출된 결과의 0번째??? 알아볼것
ori = image
ori = cv.cvtColor(ori, cv.COLOR_RGB2BGR)
image2 = image

for i in range(0, r["rois"].shape[0]): #r["rois"].shape[0]는 검출된 객체의 갯수
    # classID == 1, 즉 사람이고 점수가 0.9이상이면 해당을 검출
    if r['class_ids'][i] == 1 and r['scores'][i] >= 0.9:
        (startY, startX, endY, endX) = r["rois"][i] # roi : 검출된 객체의 좌상단 시작점과 우하단 끝점
        classID = r['class_ids'][i] # classID : 판단된 객체의 종류 이름
        mask = r['masks'][:,:,i] # mask : 객체의 마스크 정보, 전체 좌표값에 대입되며 객체인 부분은 True, 아닌 곳은 False
        color = COLORS[classID][::-1] # 사전에 랜덤으로 생성된 색상을 객체의 종류에 맞게 대입
        label = class_names[classID] # 판단된 객체의 이름
        score = r['scores'][i] # 객체의 유사도, 얼마나 확실하게 판단했는지 알 수 있는 지표

        # image에 mask를 시각화
        image = visualize.apply_mask(image, mask, color, alpha=0.5)
        # 검출된 이미지를 감싸는 사각형을 생성
        cv.rectangle(image, (startX, startY), (endX, endY), color, 2)
        text = "{}: {:.3f}".format(label, score)
        y = startY - 10 if startY - 10 > 10 else startY + 10
        # 사각형의 상단에 대상이 누구인지 글자를 넣음
        cv.putText(image, text, (startX, y),
                   cv.FONT_HERSHEY_PLAIN, 1, color, 1)

# 이미지 처리가 끝난 원본이미지를 다시 BGR로 전환
image = cv.cvtColor(image, cv.COLOR_RGB2BGR)

# 해당 윈도우를 클릭했을때 일어나는 이벤트
def click_and_crop(event, x, y, flags, param):
    # 클릭된 좌표정보, 원본 이미지를 가져옴
    global refPt_x, refPt_y, ori
    if event == cv.EVENT_LBUTTONDOWN:
        # 클릭 이벤트가 발생했을때, 해당 좌표의 정보를 저장
        refPt_x = x
        refPt_y = y

        # 전체 좌표값, 픽셀의 갯수만큼 반복
        for i in range(0,len(results[0]["masks"][refPt_y][refPt_x])):
            # 만약 클릭한 좌표가 객체이고, 사람일때 코드를 실행
            if results[0]["masks"][refPt_y][refPt_x][i] == True:
                if results[0]["class_ids"][i] == 1:
                    mask = r['masks'][:, :, i]
                    color = COLORS[classID][::-1] # 마스크 색상 지정
                    image2 = ori.copy()
                    # 마스크 정보를 저장할 black_image를 생성, 그 이미지에 마스크 정보를 전달
                    black_image = np.zeros(shape= image2.shape, dtype = np.uint8) # 빈 이미지 생성
                    black_image = visualize.apply_mask(black_image, mask, (1, 1, 1), alpha=1)
                    # black_image를 그레이스케일하고 이진화를 통해 컨투어를 생성
                    img_gray = cv.cvtColor(black_image, cv.COLOR_BGR2GRAY)
                    ret, img_binary = cv.threshold(img_gray, 127, 255, 0)
                    contours, hierarchy = cv.findContours(img_binary, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
                    # 컨투어를 원본 이미지와 빈 이미지에 그림, 마스크를 따라 더 넓게 마스크로 인식하도록 하기 위해
                    for cnt in contours:
                        cv.drawContours(image2, [cnt], 0, (255, 255, 255), 1)
                    for cnt in contours:
                        cv.drawContours(black_image, [cnt], 0, (255, 255, 255), 1)

                    image2 = visualize.apply_mask(image2, mask, (1,1,1), alpha=1)

                    # 인페인팅 처리를 위한 png파일들을 생성(mask)
                    cv.destroyWindow("mask")
                    cv.imshow("mask", black_image)
                    cv.imwrite("03mask.png", black_image)
                    cv.destroyWindow("image2")
                    cv.imshow("image2", image2)
                    cv.imwrite("03input.png", image2)

# Output이라는 이름의 윈도우에 클릭이벤트를 허용함
cv.namedWindow("Output")
cv.setMouseCallback("Output", click_and_crop)

while True:
    # image를 Output윈도우에 띄움
    cv.imshow("Output", image)
    # ESC를 누를까지 무한 반복
    if cv.waitKey(1) & 0xFF == 27:
        break;
cv.destroyAllWindows()
