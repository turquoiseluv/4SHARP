def MaskDownload(name, maskCnt):
    import ftplib, os, time
    import cv2 as cv
    import numpy as np

    CUR_DIR = os.path.abspath("./workspace/"+name+"/tmask")

    ses = ftplib.FTP("winners.dothome.co.kr", "winners", "tkdals96!")
    ses.cwd("./html/"+name)

    while True:
        lines = []
        ses.retrlines("RETR " + name+'.txt', lines.append)
        if lines[0] != str(maskCnt): break
        time.sleep(2)

    maskNum = lines[0].split()
    shape = cv.imread(os.path.join(CUR_DIR, '0.png')).shape
    if maskNum[0] == '0':
        with open(os.path.join(CUR_DIR, '0.png'), 'wb') as localfile:
            ses.retrbinary("RETR " + '0.png', localfile.write)
        localfile.close()
        image = cv.imread(os.path.join(CUR_DIR, '0.png'))
        image = cv.resize(image, (shape[1], shape[0]))
        reverse = cv.bitwise_not(image)
        _, user_mask = cv.threshold(reverse, 1, 255, cv.THRESH_BINARY)
        cv.imwrite(os.path.join(CUR_DIR, "0.png"), user_mask)

    mask = np.zeros(shape=shape, dtype=np.uint8)
    for i in maskNum:
        mask += cv.imread(os.path.join(CUR_DIR, i+'.png'))
    cv.imwrite(os.path.join(CUR_DIR, "mask.png"), mask)

    return 0

if __name__ == '__main__':
    MaskDownload('2FAF1069', 6)