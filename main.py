import sys
from m3u8_downloader import Downloader
import urllib.parse as parse
import json
from selenium_get_url import InitDriver

# 获取 m3u8 文件的 url
def get_m3u8_url(driver_path, course_url):
    url = InitDriver(driver_path, course_url).get_url()
    if url is False:
        return False
    info = url.split('?')[1].split("=")[1]
    info = parse.unquote(info, encoding='utf-8', errors='replace')
    info = json.loads(info)
    m3u8_url = info['videoPath']['mobile']
    return m3u8_url

if __name__ == '__main__':
    SAFARI_DRIVER_PATH = "/usr/bin/safaridriver"
    if sys.argv[1] == "get_url":
        COURSE_URL = sys.argv[2]
        print(get_m3u8_url(SAFARI_DRIVER_PATH, COURSE_URL))
    elif sys.argv[1] == "download":
        VIDEO_URL = sys.argv[2]
        OUTPUT_FILE_NAME = sys.argv[3]
        downloader = Downloader(50)
        downloader.run(VIDEO_URL, OUTPUT_FILE_NAME)
        print("视频已下载到 ~/Downloads/" + OUTPUT_FILE_NAME)
    else:
        print("参数错误")
