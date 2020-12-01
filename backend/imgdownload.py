def ImgDownload():
    import ftplib, os, time

    WAIT_DIR = os.path.abspath("./waiting")

    ses = ftplib.FTP("winners.dothome.co.kr", "winners", "tkdals96!")
    ses.cwd("./html/waiting")

    while True:
        data = []
        ses.dir(data.append)
        if len(data) == 0:
            time.sleep(3)
            continue

        for file in data:
            print(file)
            idx = file[::-1].find(".") + 1
            ses.mkd("./../" + file[55:-idx])
            ses.rename(file[55:], "./../" + file[55:-idx] + "/" + file[55:])

            CUR_DIR = os.path.join(WAIT_DIR, file[55:-idx])
            os.mkdir(CUR_DIR)

            ses.cwd("./../" + file[55:-idx])
            with open(os.path.join(CUR_DIR, file[55:]), 'wb') as localfile:
                ses.retrbinary("RETR " + file[55:], localfile.write)
            localfile.close()
            ses.delete(file[55:])
            ses.cwd("./../waiting")

if __name__ == '__main__':
    ImgDownload()