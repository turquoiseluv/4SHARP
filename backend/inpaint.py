
import argparse
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
#os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
import cv2
import numpy as np
import ftplib
import tensorflow as tf
tf.compat.v1.logging.set_verbosity("ERROR")
import neuralgym as ng
from inpaint_model import InpaintCAModel

ROOT_DIR = os.path.abspath("./")
MASKS_DIR = os.path.join(ROOT_DIR, "masks")
OUTPUT_DIR = os.path.join(ROOT_DIR, "output")
INPAINT_MODEL_PATH = os.path.join(ROOT_DIR, "model_logs/release_places2_256")
#INPAINT_MODEL_PATH = os.path.join(ROOT_DIR, "model_logs/release_celeba_hq_256")

FLAGS = ng.Config('inpaint.yml')
#ng.get_gpus(1)

ses = ftplib.FTP("winners.dothome.co.kr", "winners", "tkdals96!")
ses.cwd("./html/mask")

model = InpaintCAModel()
image = cv2.imread(os.listdir(MASKS_DIR))
mask = cv2.imread(os.path.join(MASKS_DIR, "0.png"))
filename = '000.jpg'
# mask = cv2.resize(mask, (0,0), fx=0.5, fy=0.5)

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
    cv2.imwrite("03result.png", result[0][:, :, ::-1])
    cv2.imwrite(os.path.join(OUTPUT_DIR, "ret_"+filename), result[0][:, :, ::-1])
    cv2.imshow("image", result[0][:, :, ::-1])
    ses.cwd("../output")
    for file in os.listdir(OUTPUT_DIR):
        with open(OUTPUT_DIR+ "\\" + file, 'rb') as localfile:
            ses.storbinary('STOR ' + file, localfile)
        #os.remove(OUTPUT_DIR + file)
    cv2.waitKey(0)
    #cv2.imwrite('new.png', image - mask)

