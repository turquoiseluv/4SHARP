# import the necessary packages
import os
import numpy as np
import cv2 as cv
import shutil
import threading
import time
import imutils
from PIL import Image
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from imgdownload import ImgDownload
from maskupload import MaskUpload
from maskdownload import MaskDownload
from imgupload import ImgUpload

from mrcnn import visualize
from mrcnn.config import Config
from mrcnn import model as modellib

import tensorflow as tf
tf.compat.v1.logging.set_verbosity("ERROR")
import neuralgym as ng
from inpaint_model import InpaintCAModel

ROOT_DIR = os.path.abspath("./")
WAIT_DIR = os.path.abspath("./waiting")
WORK_DIR = os.path.abspath("./workspace")

def png_convert(cnt, name):
    MASK_DIR = os.path.join(WORK_DIR, name + "//mask")
    for i in range(1, cnt):
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
    MASK_DIR = os.path.join(WORK_DIR, name + "//mask")
    TMASK_DIR = os.path.join(WORK_DIR, name + "//tmask")

    cv.imwrite(os.path.join(MASK_DIR, "0.png"), np.zeros(shape=image.shape, dtype=np.uint8))
    cv.imwrite(os.path.join(TMASK_DIR, "0.png"), np.zeros(shape=image.shape, dtype=np.uint8))

    maskCnt = 1
    for i in range(0, r["rois"].shape[0]):
        if r['scores'][i] >= 0.9 and r['class_ids'][i] == 1:
            savefile = str(maskCnt) + ".png"
            maskCnt += 1
            mask = r['masks'][:, :, i]
            image2 = image.copy()
            black_image = np.zeros(shape=image2.shape, dtype=np.uint8)
            black_image = visualize.apply_mask(black_image, mask, (1, 1, 1), alpha=1)
            img_gray = cv.cvtColor(black_image, cv.COLOR_BGR2GRAY)
            ret, img_binary = cv.threshold(img_gray, 127, 255, 0)
            _, contours, hierarchy = cv.findContours(img_binary, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)
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
    MASK_DIR = os.path.join(WORK_DIR, name+"//mask")
    TMASK_DIR = os.path.join(WORK_DIR, name+"//tmask")

    COCO_MODEL_PATH = os.path.join(ROOT_DIR, "mask_rcnn_coco.h5")
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

    CUR_DIR = os.path.join(WORK_DIR, name)

    filename = os.listdir(CUR_DIR)
    image = cv.imread(os.path.join(CUR_DIR, filename[0]))

    if image.shape[0] >= image.shape[1] and image.shape[0] > 720:
        image = imutils.resize(image, height=720)
    elif image.shape[0] <= image.shape[1] and image.shape[1] > 720:
        image = imutils.resize(image, width=720)

    cv.imwrite(os.path.join(CUR_DIR, name + ".png"), image)

    image = cv.cvtColor(image, cv.COLOR_BGR2RGB)
    results = model.detect([image], verbose=1)
    r = results[0]

    os.mkdir(MASK_DIR)
    os.mkdir(TMASK_DIR)
    maskCnt = makeMask(r, image, name)

    f = open(os.path.join(CUR_DIR, name) + '.txt', 'w', encoding='ANSI')
    f.write(str(maskCnt))
    f.close()

    #os.remove(os.path.join(CUR_DIR, filename[0]))
    return maskCnt

def inpaintP(name):
    CUR_DIR = os.path.join(WORK_DIR, name)
    TMASK_DIR = os.path.join(WORK_DIR, name+"//tmask")
    INPAINT_MODEL_PATH = os.path.join(ROOT_DIR, "model_logs/release_places2_256")

    FLAGS = ng.Config('inpaint.yml')
    model = InpaintCAModel()

    image = cv.imread(os.path.join(CUR_DIR, f"{name}.png"))
    mask = cv.imread(os.path.join(TMASK_DIR, "mask.png"))
    filename = f'4#_{name}.png'

    assert image.shape == mask.shape

    h, w, _ = image.shape
    grid = 8
    image = image[:h//grid*grid, :w//grid*grid, :]
    mask = mask[:h//grid*grid, :w//grid*grid, :]
    print('Shape of image: {}'.format(image.shape))

    image = np.expand_dims(image, 0)
    mask = np.expand_dims(mask, 0)
    input_image = np.concatenate([image, mask], axis=2)

    sess_config = tf.ConfigProto()
    sess_config.gpu_options.per_process_gpu_memory_fraction = 0.5
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
                var_value = tf.contrib.framework.load_variable(INPAINT_MODEL_PATH, from_name)
                assign_ops.append(tf.assign(var, var_value))

            sess.run(assign_ops)
            print('Model loaded.')
            result = sess.run(output)
            cv.imwrite(os.path.join(CUR_DIR, filename), result[0][:, :, ::-1])
            print('Image has been made')

    return 0

def process(name):
    print("4# start")
    import timeit
    start_time = timeit.default_timer()
    maskCnt = detectP(name)
    terminate_time = timeit.default_timer()
    print("detectP %f초 걸렸습니다." % (terminate_time - start_time))
    while True:
        if os.path.exists(os.path.join(WORK_DIR, name+"/"+name+".txt")) == False:
            time.sleep(2)
            continue
        time.sleep(1)
        break
    MaskUpload(name)
    MaskDownload(name, maskCnt)
    start_time = timeit.default_timer()
    inpaintP(name)
    terminate_time = timeit.default_timer()
    print("inpaintP %f초 걸렸습니다." % (terminate_time - start_time))
    ImgUpload(name, maskCnt)
    print("4# end")
    return 0

imgd = threading.Thread(target=ImgDownload)
imgd.daemon = True
imgd.start()

while True:
    waiting = os.listdir(WAIT_DIR)
    if waiting == []:
        time.sleep(2)
        continue
    time.sleep(1)
    print(f"waiting is {waiting}")
    for name in waiting:
        shutil.copytree(os.path.join(WAIT_DIR, name), os.path.join(WORK_DIR, name))
        shutil.rmtree(os.path.join(WAIT_DIR, name), ignore_errors=True)
        time.sleep(1)
        threading.Thread(target=process, args=(name,)).start()