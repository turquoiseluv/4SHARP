
# import the necessary packages
import os
import numpy as np
import cv2 as cv

from mrcnn import visualize
from mrcnn import utils

import imutils
from PIL import Image

import ftplib

ROOT_DIR = os.path.abspath("./workspace/")
MASK_DIR = os.path.join(ROOT_DIR, "mask")
TMASK_DIR = os.path.join(ROOT_DIR, "tmask")

def png_convert(cnt):
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

    ses.cwd("./mask")
    for file in os.listdir(MASK_DIR):
        with open(os.path.join(MASK_DIR, file), 'rb') as localfile:
            ses.storbinary('STOR ' + file, localfile)
        #os.remove(os.path.join(MASK_DIR, file))
    ses.cwd("./..")

def makeMask(r, image):
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
    png_convert(maskCnt)
    return maskCnt

def detectP(name, model):
    global ses
    ses = ftplib.FTP("winners.dothome.co.kr", "winners", "tkdals96!")
    ses.set_pasv(True)
    ses.cwd("./html/" + name)

    CUR_DIR = os.path.join(ROOT_DIR, name)
    os.mkdir(CUR_DIR)
    os.chdir(CUR_DIR)

    data = []
    ses.dir(data.append)
    filename = data[0][55:]
    with open(os.path.join(CUR_DIR, filename), 'wb') as localfile:
        ses.retrbinary("RETR " + filename, localfile.write)
    #ses.delete(filename)

    image = cv.imread(filename)
    if image.shape[0] >= image.shape[1]:
        image = imutils.resize(image, height=720)
    else :
        image = imutils.resize(image, width=720)

    image = cv.cvtColor(image, cv.COLOR_BGR2RGB)
    results= model.detect([image], verbose=1)
    r = results[0]

    os.chdir(MASK_DIR)
    os.chdir(TMASK_DIR)
    maskCnt = makeMask(r, image)

    f = open(os.path.join(CUR_DIR, filename) + '.txt', 'w', encoding='ANSI')
    f.write(maskCnt)
    f.close()

    file = name + ".txt"
    with open(os.path.join(CUR_DIR, file), 'rb') as localfile:
        ses.storbinary('STOR ' + file, localfile)

    ses.close()
    exit()