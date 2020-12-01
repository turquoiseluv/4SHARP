def ImgUpload(name, maskCnt):
    import ftplib, os, time, shutil

    CUR_DIR = os.path.abspath("./workspace/"+name)

    ses = ftplib.FTP("winners.dothome.co.kr", "winners", "tkdals96!")
    ses.cwd("./html/"+name)

    for i in range(maskCnt):
        ses.delete(str(i)+'.png')

    filename = '4#_'+name+'.png'
    with open(os.path.join(CUR_DIR, filename), 'rb') as localfile:
        ses.storbinary("STOR " + filename, localfile)
    localfile.close()

    f = open(os.path.join(CUR_DIR, name+'.txt') , 'w', encoding='ANSI')
    f.write("done")
    f.close()

    with open(os.path.join(CUR_DIR, name+".txt"), 'rb') as localfile:
        ses.storbinary("STOR " + f"{name}.txt", localfile)
        localfile.close()

    while True:
        lines = []
        ses.retrlines("RETR " + name + '.txt', lines.append)
        if lines[0] == "thanks": break
        time.sleep(2)

    ses.delete(filename)
    ses.delete(name+'.txt')
    ses.cwd("./../")
    ses.rmd(name)

    shutil.rmtree(CUR_DIR, ignore_errors=True)

    return 0

if __name__ == '__main__':
    ImgUpload('NewYork', 12)