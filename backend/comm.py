import shutil
import threading
import time
import os

from imgdownload import ImgDownload
from maskupload import MaskUpload
from detect import detectP

ROOT_DIR = os.path.abspath("./")
WAIT_DIR = os.path.abspath("./waiting")
WORK_DIR = os.path.abspath("./workspace")

imgd = threading.Thread(target=ImgDownload)
imgd.daemon = True
imgd.start()

def process(name):
    print("detectP start")
    detectP(name)
    print("detectP end")
    while True:
        if os.path.exists(os.path.join(WORK_DIR, name+"/"+name+".txt")) == False:
            time.sleep(5)
            continue
        time.sleep(1)
        break
    MaskUpload(name)


while True:
    waiting = os.listdir(WAIT_DIR)
    if waiting == []:
        time.sleep(5)
        print("waiting is empty")
        continue
    time.sleep(1)
    print(f"waiting is {waiting}")
    for name in waiting:
        shutil.copytree(os.path.join(WAIT_DIR, name), os.path.join(WORK_DIR, name))
        shutil.rmtree(os.path.join(WAIT_DIR, name), ignore_errors=True)
        time.sleep(1)
        threading.Thread(target=process, args=(name,)).start()

