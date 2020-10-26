
# import the necessary packages
import os
import numpy as np
import cv2 as cv
import shutil
import imutils
from PIL import Image

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from mrcnn import visualize
from mrcnn.config import Config
from mrcnn import model as modellib

BACK_DIR = os.path.abspath("./")
ROOT_DIR = os.path.abspath("./workspace/")

def png_convert(cnt, name):
    MASK_DIR = os.path.join(ROOT_DIR, name + "//mask")
    TMASK_DIR = os.path.join(ROOT_DIR, name + "//tmask")
    for i in range(0, cnt):
        savefile = str(i)+".png"
        img = Image.open(os.path.join(MASK_DIR, savefile))
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            if item[0] + item[1] + item[2] == 0:
                newData.append((item[0], item[1], item[2], 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(os.path.join(MASK_DIR, savefile), "PNG")

def makeMask(r, image, name):
    MASK_DIR = os.path.join(ROOT_DIR, name + "//mask")
    TMASK_DIR = os.path.join(ROOT_DIR, name + "//tmask")

    maskCnt = 0
    for i in range(0, r["rois"].shape[0]):
        if r['scores'][i] >= 0.8 and r['class_ids'][i] == 1:
            savefile = str(maskCnt) + ".png"
            maskCnt += 1
            mask = r['masks'][:, :, i]
            image2 = image.copy()
            black_image = np.zeros(shape=image2.shape, dtype=np.uint8)
            black_image = visualize.apply_mask(black_image, mask, (1, 1, 1), alpha=1)
            img_gray = cv.cvtColor(black_image, cv.COLOR_BGR2GRAY)
            ret, img_binary = cv.threshold(img_gray, 127, 255, 0)
            contours, hierarchy = cv.findContours(img_binary, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                cv.drawContours(black_image, [cnt], 0, (255, 255, 255), 2)
            cv.imwrite(os.path.join(MASK_DIR, savefile), black_image)
            for cnt in contours:
                cv.drawContours(black_image, [cnt], 0, (255, 255, 255), 13)
            cv.imwrite(os.path.join(TMASK_DIR, savefile), black_image)
    png_convert(maskCnt, name)
    return maskCnt

def detectP(name):
    print(name)
    MASK_DIR = os.path.join(ROOT_DIR, name+"//mask")
    TMASK_DIR = os.path.join(ROOT_DIR, name+"//tmask")

    COCO_MODEL_PATH = os.path.join(BACK_DIR, "mask_rcnn_coco.h5")
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

    class SimpleConfig(Config):
        NAME = "coco_inference"
        GPU_COUNT = 1
        IMAGES_PER_GPU = 1
        NUM_CLASSES = len(class_names)

    config = SimpleConfig()
    model = modellib.MaskRCNN(mode='inference', config=config
                              , model_dir=os.getcwd())
    model.load_weights(COCO_MODEL_PATH, by_name=True)

    CUR_DIR = os.path.join(ROOT_DIR, name)

    filename = os.listdir(CUR_DIR)
    image = cv.imread(os.path.join(CUR_DIR, filename[0]))

    if image.shape[0] >= image.shape[1]:
        image = imutils.resize(image, height=720)
    else :
        image = imutils.resize(image, width=720)
    cv.imwrite(os.path.join(CUR_DIR, name + ".png", image))

    image = cv.cvtColor(image, cv.COLOR_BGR2RGB)
    results= model.detect([image], verbose=1)
    r = results[0]

    os.mkdir(MASK_DIR)
    os.mkdir(TMASK_DIR)
    maskCnt = makeMask(r, image, name)

    f = open(os.path.join(CUR_DIR, name) + '.txt', 'w', encoding='ANSI')
    f.write(str(maskCnt))
    f.close()

    os.remove(os.path.join(CUR_DIR, filename[0]))
    exit()