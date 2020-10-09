import requests
import threading
import time
import keyboard

''' --- ftp --- '''
import ftplib
ses = ftplib.FTP("winners.dothome.co.kr", "winners", "tkdals96!")
print("ftp set")
''' --- ftp --- '''


''' --- detect --- '''
from mrcnn.config import Config
from mrcnn import model as modellib
from detect import detectP
import os



ROOT_DIR = os.path.abspath("./")
WAIT_DIR = os.path.join(ROOT_DIR, "waiting\\")
COCO_MODEL_PATH = os.path.join(ROOT_DIR, "mask_rcnn_coco.h5")
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
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
                      ,model_dir=os.getcwd())
model.load_weights(COCO_MODEL_PATH, by_name=True)
''' --- detect --- '''



''' --- inpaint --- '''
#session = ftplib.FTP("winners.dothome.co.kr", "winners", "tkdals96!")
''' --- inpaint --- '''




ses.cwd("./html/waiting")
prior = []
p = threading.Condition()

def waitCheck():
    print("waitCheck working")
    while True:
        data = []
        ses.dir(data.append)
        print("data : ", data)
        if len(data) == 0:
            time.sleep(3)
            continue

        p.acquire()
        for file in data:
            prior.append(file[55:-4])
            ses.mkd("./../" + file[55:-4])
            ses.rename(file[55:], "./../" + file[55:-4]  + "/" + file[55:])
        p.release()

wc = threading.Thread(target=waitCheck)
wc.daemon = True
wc.start()

c = threading.Condition()
maxThread = 5
curThread = 0

def processing(name):
    print("processing working")
    detectP(name, model)

    #CUR_DIR = os.path.join(ROOT_DIR, name)
    while True:
        status = requests.get("http://winners.dothome.co.kr/" + name + ".txt").text
        print(status)
        if status[0] == "n" or status[0] == "s":
            break
    print("detect end")

    global curThread
    curThread -= 1

    return 0


print("main start")
while True:
    if len(prior) == 0:
        print("prior : ", prior)
        time.sleep(3)
        continue

    while curThread != maxThread:
        if len(prior) == 0:
            break
        print("new thread")
        p.acquire()
        t = threading.Thread(target=processing, args=(prior.pop(0),))
        t.start()
        p.release()
        curThread += 1

    if keyboard.is_pressed('-'):
        if curThread == 0:
            exit()
        else:
            print("there are threads not over yet")
            print("press '=' if you continue to end")
            if keyboard.is_pressed('='):
                exit()
