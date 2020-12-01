import re

'''
'?[+] | [-]' + '[0-9]+ [.] [0-9]*' + '[E] | [e]' '?[+] | [-]' + '[0-9]
'''

import shutil, os
ROOT_DIR = os.path.abspath("./")
WAIT_DIR = os.path.abspath("./waiting")
WORK_DIR = os.path.abspath("./workspace")
name = 'original'
shutil.copytree(os.path.join(WAIT_DIR, name), os.path.join(WORK_DIR, name))
shutil.rmtree(os.path.join(WAIT_DIR, name), ignore_errors=True)