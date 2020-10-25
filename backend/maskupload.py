def MaskUpload(name):
    import ftplib, os, time

    CUR_DIR = os.path.abspath("./workspace/"+name+"/mask")

    ses = ftplib.FTP("winners.dothome.co.kr", "winners", "tkdals96!")
    ses.cwd("./html/"+name)

    listdir = os.listdir(CUR_DIR)
    print(listdir)
    for i in listdir:
        with open(os.path.join(CUR_DIR, i), 'rb') as localfile:
            ses.storbinary("STOR " + i, localfile)
        localfile.close()

    with open(os.path.abspath(f"./workspace/{name}/{name}.txt"), 'rb') as localfile:
        ses.storbinary("STOR " + f"{name}.txt", localfile)
        localfile.close()