# import the necessary packages
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
#os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
import random
import numpy as np
import cv2 as cv
import colorsys
import argparse
import imutils
import sys
import matplotlib.pyplot as plt
from mrcnn import utils
import tensorflow as tf
tf.compat.v1.logging.set_verbosity("ERROR")
import neuralgym as ng
from inpaint_model import InpaintCAModel



# detecting part
from mrcnn.config import Config
from mrcnn import model as modellib
from mrcnn import visualize
ROOT_DIR = os.path.abspath("./")
MODEL_DIR = os.path.join(ROOT_DIR, "logs")
MASKS_DIR = os.path.join(ROOT_DIR, "masks")
COCO_MODEL_PATH = os.path.join(ROOT_DIR, "mask_rcnn_coco.h5")
INPAINT_MODEL_PATH = os.path.join(ROOT_DIR, "model_logs/release_places2_256")
IMAGE_DIR = os.path.join(ROOT_DIR, "mysample")
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
hsv = [(i / len(class_names), 1, 1.0) for i in range (len(class_names))]
COLORS = list(map(lambda c: colorsys.hsv_to_rgb(*c), hsv))
random.seed(42)
random.shuffle(COLORS)

class SimpleConfig(Config):
    NAME = "coco_inference"
    GPU_COUNT = 1
    IMAGES_PER_GPU = 1
    NUM_CLASSES = len(class_names)

def Inpainting():
    FLAGS = ng.Config('inpaint.yml')
    # ng.get_gpus(1)
    model = InpaintCAModel()
    image = cv.imread("03raw.png")
    mask = cv.imread("03mask.png")
    checkpoint_dir = 'model_logs/release_places2_256'
    #checkpoint_dir = 'model_logs/release_places2_256_2'
    #checkpoint_dir = 'model_logs/release_celeba_hq_256'
    assert image.shape == mask.shape
    h, w, _ = image.shape
    grid = 8
    image = image[:h // grid * grid, :w // grid * grid, :]
    mask = mask[:h // grid * grid, :w // grid * grid, :]
    print('Shape of image: {}'.format(image.shape))

    image = np.expand_dims(image, 0)
    mask = np.expand_dims(mask, 0)
    input_image = np.concatenate([image, mask], axis=2)

    sess_config = tf.ConfigProto()
    sess_config.gpu_options.allow_growth = True
    tf2 = tf.Graph()
    with tf2.as_default():
        with tf.Session(config=sess_config) as sess:
            input_image = tf.constant(input_image, dtype=tf.float32)
            output = model.build_server_graph(FLAGS, input_image)
            output = (output + 1.) * 127.5
            output = tf.reverse(output, [-1])
            output = tf.saturate_cast(output, tf.uint8)
            # load pretrained model
            vars_list = tf.get_collection(tf.GraphKeys.GLOBAL_VARIABLES)
            assign_ops = []
            for var in vars_list:
                vname = var.name
                from_name = vname
                var_value = tf.contrib.framework.load_variable(checkpoint_dir, from_name)
                assign_ops.append(tf.assign(var, var_value))
            sess.run(assign_ops)
            print('Model loaded.')
            result = sess.run(output)
            resultimage = result[0][:,:,::-1]
            cv.imshow("image", resultimage)
            cv.waitKey(0)
            sess.close()
            cv.imwrite('03result.png',resultimage)

config = SimpleConfig()
model = modellib.MaskRCNN(mode='inference', config=config, model_dir=os.getcwd())
model.load_weights(COCO_MODEL_PATH, by_name=True)
filename = '10.jpg'
image = cv.imread(os.path.join(IMAGE_DIR, filename))
#if image.shape[0] >= image.shape[1]:
#    image = imutils.resize(image, height=512)
#else :
#    image = imutils.resize(image, width=512)

cv.imwrite("03raw.png", image)
image = cv.cvtColor(image, cv.COLOR_BGR2RGB)

h, w, c = image.shape

results= model.detect([image], verbose=1)
r = results[0]
ori = image
ori = cv.cvtColor(ori, cv.COLOR_RGB2BGR)
image2 = image
list = []
masks = []
for i in range(0, r["rois"].shape[0]):
    if r['scores'][i] >= 0.5:
        (startY, startX, endY, endX) = r["rois"][i]
        classID = r['class_ids'][i]
        mask = r['masks'][:,:,i]
        color = COLORS[classID][::-1]
        label = class_names[classID]
        score = r['scores'][i]

        image = visualize.apply_mask(image, mask, color, alpha=0.5)

        cv.rectangle(image, (startX, startY), (endX, endY), color, 2)
        text = "{}: {:.3f}".format(label, score)
        y = startY - 10 if startY - 10 > 10 else startY + 10
        cv.putText(image, text, (startX, y),
                   cv.FONT_HERSHEY_PLAIN, 1, color, 1)

image = cv.cvtColor(image, cv.COLOR_RGB2BGR)

def click_and_crop2(event, x, y, flags, param):
    global refPt_x, refPt_y, list
    if event == cv.EVENT_LBUTTONDOWN:
        refPt_x = x
        refPt_y = y

        for i in range(0,len(results[0]["masks"][refPt_y][refPt_x])):
            if results[0]["masks"][refPt_y][refPt_x][i] == True:
                print(i)
                list.append(i)

def addmask(list):
    global image2
    print(list)
    black_image = np.zeros(shape=image2.shape, dtype=np.uint8)
    for image in list:
        filename = str(image) + '.png'
        print(filename)
        mask = cv.imread(os.path.join(MASKS_DIR, filename))
        print(image2.shape)
        print(mask.shape)
        black_image = cv.add(black_image, mask)

    cv.imshow('result', black_image)
    cv.imwrite("03mask.png", black_image)
    Inpainting()

def click_and_crop():
    global refPt_x, refPt_y, sel_num, image2, ori


    for i in range(0,r["rois"].shape[0]):
        if results[0]['scores'][i] >= 0.5:
            classID = r['class_ids'][i]
            mask = r['masks'][:, :, i]
            color = COLORS[classID][::-1]
            image2 = ori.copy()
            black_image = np.zeros(shape= image2.shape, dtype = np.uint8)
            black_image = visualize.apply_mask(black_image, mask, (1, 1, 1), alpha=1)
            img_gray = cv.cvtColor(black_image, cv.COLOR_BGR2GRAY)
            ret, img_binary = cv.threshold(img_gray, 127, 255, 0)
            contours, hierarchy = cv.findContours(img_binary, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

            for cnt in contours:
                cv.drawContours(black_image, [cnt], 0, (255, 255, 255), 2)

            image2 = visualize.apply_mask(image2, mask, (1,1,1), alpha=1)
            masks.append(mask)
            savefile = str(i) + ".png"
            cv.imwrite(os.path.join(MASKS_DIR,savefile), black_image)
cv.namedWindow("Output")
cv.setMouseCallback("Output", click_and_crop2)

click_and_crop()
while True:
    cv.imshow("Output", image)

    if cv.waitKey(1) & 0xFF == 27:
        break;
    if cv.waitKey(1) & 0xFF == 32:
        addmask(list)
cv.destroyAllWindows()

