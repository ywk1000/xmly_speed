"""
钢蹦阅读_V1.8   

入口 微信打开：http://2650317.vofr83a63b.dyybgj.jqlwhewapph9h.cloud/page?p=2650317  (链接可能被劫持，请多试几次)

建议将链接添加至微信收藏，方便进入查看

提示：检测文章不过，有黑号的风险，如不能及时接收检测文章推送，或不能能及时阅读检测文章，建议手动运行脚本，运行前去微信手动阅读三篇文章，每篇阅读6秒以上。
      每天180个任务不建议跑满，细水长流，如出现阅读更新中，你的账号可能风险，建议24小时后再操作，平时从订阅号多读读文章，可以减小黑号的几率

8/18_update 修复bug
8/22_update  增加推送检测文章   将多个账号检测文章推送至目标微信，手动点击链接完成检测阅读
8/29_update  更新检测文章逻辑 优化日志
9/4_update   修复bug，日志添加Emoji，查看更直观
9/8_update   支持pushplus+推送，增加并发(缩短运行时间)
9/14_update   修复bug，增加稳定性

@仅供学习交流，请在下载后的24小时内完全删除 请勿将任何内容用于商业或非法目的，否则后果自负。

@建议一个微信号只运行一个阅读任务，否则极其容易黑号

阅读文章抓出cookie（找不到搜索gfsessionid关键词） 建议手动阅读5篇左右再使用脚本，不然100%黑！！！
key为企业微信webhook机器人后面的 key  ，也可以填写pushplus口令   如：ff2cdxxxxxxxx
变量名称：ydtoken     变量值：gfsessionid=o-0fIv9cGv3xxxxxxx
多账号用'@'隔开 例 账号1@账号2

定时:
自动定时规则cron：0 7-23/3 * * *   (每天7-23点每3小时一次)
手动定时规则cron：0 0 1 1 *    (每年1月1日0点1次)
"""

max_concurrency = 0  # 并发线程数
money_Withdrawal = 0  # 提现开关 1开启 0关闭
key = ""        #key为企业微信webhook机器人后面的 key，或pushplus口令，二选一





import re
import hashlib
import json
import os
import random

import threading
import time
from multiprocessing import Pool
from multiprocessing.pool import ThreadPool
import requests

lock = threading.Lock()


def process_account(account, i):
    values = account.split('@')
    cookie = values[0]

    print(f"\n=======💚开始执行账号{i}💚=======")
    current_time = str(int(time.time()))

    sign_str = f'key=4fck9x4dqa6linkman3ho9b1quarto49x0yp706qi5185o&time={current_time}'
    sha256_hash = hashlib.sha256(sign_str.encode())
    sign = sha256_hash.hexdigest()
    url = "http://2477726.neavbkz.jweiyshi.r0ffky3twj.cloud/share"
    headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 9; V1923A Build/PQ3B.190801.06161913; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4470.114 Safari/537.36 MMWEBID/5635 MicroMessenger/8.0.40.2420(0x28002837) WeChat/arm64 Weixin Android Tablet NetType/WIFI Language/zh_CN ABI/arm64",
        "Cookie": cookie
    }

    data = {
        "time": current_time,
        "sign": sign
    }

    with lock:
        response = requests.get(url, headers=headers, json=data).json()
        share_link = response['data']['share_link'][0]
        p_value = share_link.split('=')[1].split('&')[0]

        url = "http://2477726.neavbkz.jweiyshi.r0ffky3twj.cloud/read/info"

        response = requests.get(url, headers=headers, json=data).json()

        if response['code'] == 0:
            remain = response['data']['remain']
            read = response['data']['read']
            print(f"ID:{p_value}-----💰钢镚余额:{remain}\n📖今日阅读量::{read}")
        else:
            print(response['message'])

    print("============💚开始执行阅读文章💚============")

    for j in range(30):
        biz_list = ['MzkyMzI5NjgxMA==', 'MzkzMzI5NjQ3MA==', 'Mzg5NTU4MzEyNQ==', 'Mzg3NzY5Nzg0NQ==',
                    'MzU5OTgxNjg1Mg==', 'Mzg4OTY5Njg4Mw==', 'MzI1ODcwNTgzNA==','Mzg2NDY5NzU0Mw==']
        # 计算 sign
        sign_str = f'key=4fck9x4dqa6linkman3ho9b1quarto49x0yp706qi5185o&time={current_time}'
        sha256_hash = hashlib.sha256(sign_str.encode())
        sign = sha256_hash.hexdigest()
        url = "http://2477726.9o.10r8cvn6b1.cloud/read/task"

        try:
            response = requests.get(url, headers=headers, json=data, timeout=7).json()
        except requests.Timeout:
            print("❗请求超时，尝试重新发送请求...")
            response = requests.get(url, headers=headers, json=data, timeout=7).json()
        if response['code'] == 1:
            print(response['message'])
            break
        else:
            try:
                mid = response['data']['link'].split('&mid=')[1].split('&')[0]
                biz = response['data']['link'].split('__biz=')[1].split('&')[0]

                print(f"[{p_value}]获取文章成功---{mid} 来源[{biz}]")

                if biz in biz_list:
                    print(f"发现目标[{biz}] 疑似检测文章！！！")
                    link = response['data']['link']
                    url = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=' + key

                    messages = [
                        f"出现检测文章！！！\n{link}\n请在60s内点击链接完成阅读",
                    ]

                    for message in messages:
                        data = {
                            "msgtype": "text",
                            "text": {
                                "content": message
                            }
                        }
                        headers = {'Content-Type': 'application/json'}
                        response = requests.post(url, headers=headers, data=json.dumps(data))

                        url = 'http://www.pushplus.plus/send'
                        data = {
                             "token": key,
                             "title": "出现检测文章！请在60s内完成阅读",
                             "content": f'<a href="\n{link}\n"target="_blank">点击阅读6s以上',  
                             "template": "html"
                        }
                        response = requests.post(url, data=data).json()                                                   
                        
                        print("已将该文章推送至微信请在60s内点击链接完成阅读--60s后继续运行")
                        time.sleep(60)
                        url = "http://2477726.9o.10r8cvn6b1.cloud/read/finish"
                        headers = {
                            "User-Agent": "Mozilla/5.0 (Linux; Android 9; V1923A Build/PQ3B.190801.06161913; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4470.114 Safari/537.36 MMWEBID/5635 MicroMessenger/8.0.40.2420(0x28002837) WeChat/arm64 Weixin Android Tablet NetType/WIFI Language/zh_CN ABI/arm64",
                            "Cookie": cookie
                        }
                        data = {
                            "time": current_time,
                            "sign": sign
                        }
                        try:
                            response = requests.get(url, headers=headers, data=data, timeout=7).json()
                        except requests.Timeout:
                            print("❗请求超时，尝试重新发送请求...")
                            response = requests.get(url, headers=headers, data=data, timeout=7).json()
                        if response['code'] == 0:
                            gain = response['data']['gain']
                            print(f"第{j + 1}次阅读检测文章成功---获得钢镚[{gain}]")
                            print(f"--------------------------------")
                        else:
                            print(f"❗过检测失败，请尝试重新运行")
                            break
                else:
                    sleep = random.randint(8, 15)
                    print(f"本次模拟阅读{sleep}秒")
                    time.sleep(sleep)
                    url = "http://2477726.9o.10r8cvn6b1.cloud/read/finish"
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Linux; Android 9; V1923A Build/PQ3B.190801.06161913; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4470.114 Safari/537.36 MMWEBID/5635 MicroMessenger/8.0.40.2420(0x28002837) WeChat/arm64 Weixin Android Tablet NetType/WIFI Language/zh_CN ABI/arm64",
                        "Cookie": cookie
                    }
                    data = {
                        "time": current_time,
                        "sign": sign
                    }
                    try:
                        response = requests.get(url, headers=headers, data=data, timeout=7).json()
                    except requests.Timeout:
                        print("❗请求超时，尝试重新发送请求...")
                        response = requests.get(url, headers=headers, data=data, timeout=7).json()
                    if response['code'] == 0:
                        gain = response['data']['gain']
                        print(f"第{j + 1}次阅读文章成功---获得钢镚[{gain}]")
                        print(f"--------------------------------")
                    else:
                        print(f"❗阅读文章失败{response}")
                        break
            except KeyError:
                print(f"❗获取文章失败,错误未知{response}")
                break
    if money_Withdrawal == 1:
        print(f"============💰开始微信提现💰============")
        url = "http://2477726.84.8agakd6cqn.cloud/withdraw/wechat"

        response = requests.get(url, headers=headers, json=data).json()
        if response['code'] == 0:
            print(response['message'])
        elif response['code'] == 1:
            print(response['message'])
        else:
            print(f"错误未知{response}")
    elif money_Withdrawal == 0:
        print(f"{'-' * 30}\n不执行提现")


if __name__ == "__main__":
    accounts = os.getenv('ydtoken')
    if accounts is None:
        print('请检查你的ydtoken，是否填写正确')
    else:
        response = requests.get('https://netcut.cn/p/e9a1ac26ab3e543b')
        note_content_list = re.findall(r'"note_content":"(.*?)"', response.text)
        formatted_note_content_list = [note.replace('\\n', '\n').replace('\\/', '/') for note in note_content_list]
        for note in formatted_note_content_list:
            print(note)
        accounts_list = os.environ.get('ydtoken').split('@')
        num_of_accounts = len(accounts_list)
        print(f"获取到 {num_of_accounts} 个账号")
        with Pool(processes=num_of_accounts) as pool:
            thread_pool = ThreadPool(max_concurrency)
            thread_pool.starmap(process_account, [(account, i) for i, account in enumerate(accounts_list, start=1)])
