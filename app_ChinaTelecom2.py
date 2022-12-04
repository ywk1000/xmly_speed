#!/usr/bin/python3
# -- coding: utf-8 --
# -------------------------------
# @Author : github@limoruirui https://github.com/limoruirui
# @Time : 2022/9/12 16:10
# cron &quot;1 9,12 * * *&quot; script-path=xxx.py,tag=匹配cron用
# const $ = new Env(&apos;电信签到&apos;);
# -------------------------------

&quot;&quot;&quot;
1. 电信签到 不需要抓包 脚本仅供学习交流使用, 请在下载后24h内删除
2. cron说明 12点必须执行一次(用于兑换) 然后12点之外还需要执行一次(用于执行每日任务) 一天共两次 可直接使用默认cron
2. 环境变量说明:
    必须  TELECOM_LOTTERY : 电信手机号@电信服务密码@宠物喂食次数(默认0,最大10)&手机号2@密码2@喂食数2
    # TELECOM       13311111111@111111@0&13322222222@222222@10
    并发命令：task WWJqingcheng_dx/china_telecom2.py conc TELECOM
    task 后边是脚本所在目录/china_telecom2.py conc TELECOM
3. 必须登录过 电信营业厅 app的账号才能正常运行
&quot;&quot;&quot;
&quot;&quot;&quot;
update:
    2022.10.25 参考大佬 github@QGCliveDavis https://github.com/QGCliveDavis 的 loginAuthCipherAsymmertric 参数解密 新增app登录获取token 完成星播客系列任务 感谢大佬
    2022.11.11 增加分享任务
&quot;&quot;&quot;
from datetime import date, datetime
from random import shuffle, randint, choices
from time import sleep, strftime
from re import findall
import re
from requests import get, post
from base64 import b64encode
from tools.aes_encrypt import AES_Ctypt
from tools.rsa_encrypt import RSA_Encrypt
from tools.tool import timestamp, get_environ, print_now
from tools.send_msg import push
from login.telecom_login import TelecomLogin
from string import ascii_letters, digits



class ChinaTelecom:
    def __init__(self, account, pwd, checkin=True):
        self.phone = account
        self.ticket = &quot;&quot;
        self.token = &quot;&quot;
        if pwd != &quot;&quot; and checkin:
            userLoginInfo = TelecomLogin(account, pwd).main()
            self.ticket = userLoginInfo[0]
            self.token = userLoginInfo[1]

    def init(self):
        self.msg = &quot;&quot;
        self.ua = f&quot;CtClient;9.6.1;Android;12;SM-G9860;{b64encode(self.phone[5:11].encode()).decode().strip(&apos;=+&apos;)}!#!{b64encode(self.phone[0:5].encode()).decode().strip(&apos;=+&apos;)}&quot;
        self.headers = {
            &quot;Host&quot;: &quot;wapside.189.cn:9001&quot;,
            &quot;Referer&quot;: &quot;https://wapside.189.cn:9001/resources/dist/signInActivity.html&quot;,
            &quot;User-Agent&quot;: self.ua
        }
        self.key = &quot;-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+ugG5A8cZ3FqUKDwM57GM4io6\nJGcStivT8UdGt67PEOihLZTw3P7371+N47PrmsCpnTRzbTgcupKtUv8ImZalYk65\ndU8rjC/ridwhw9ffW2LBwvkEnDkkKKRi2liWIItDftJVBiWOh17o6gfbPoNrWORc\nAdcbpk2L+udld5kZNwIDAQAB\n-----END PUBLIC KEY-----&quot;

    def req(self, url, method, data=None):
        if method == &quot;GET&quot;:
            data = get(url, headers=self.headers).json()
            return data
        elif method.upper() == &quot;POST&quot;:
            data = post(url, headers=self.headers, json=data).json()
            return data
        else:
            print_now(&quot;您当前使用的请求方式有误,请检查&quot;)

    # 长明文分段rsa加密
    def telecom_encrypt(self, text):
        if len(text) <= 32:
            return RSA_Encrypt(self.key).encrypt(text)
        else:
            encrypt_text = &quot;&quot;
            for i in range(int(len(text) / 32) + 1):
                split_text = text[(32 * i):(32 * (i + 1))]
                encrypt_text += RSA_Encrypt(self.key).encrypt(split_text)
            return encrypt_text
    @staticmethod
    def geneRandomToken():
        randomList = choices(ascii_letters + digits, k=129)
        token = f&quot;V1.0{&apos;&apos;.join(x for x in randomList)}&quot;
        return token
    # 签到
    def chech_in(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/api/home/sign&quot;
        data = {
            &quot;encode&quot;: AES_Ctypt(&quot;34d7cb0bcdf07523&quot;).encrypt(
                f&apos;{{&quot;phone&quot;:{self.phone},&quot;date&quot;:{timestamp()},&quot;signSource&quot;:&quot;smlprgrm&quot;}}&apos;)
        }
        print_now(self.req(url, &quot;post&quot;, data))

    # 获取任务列表
    def get_task(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/paradise/getTask&quot;
        data = {
            &quot;para&quot;: self.telecom_encrypt(f&apos;{{&quot;phone&quot;:{self.phone}}}&apos;)
        }
        msg = self.req(url, &quot;post&quot;, data)
        # print_now(dumps(msg, indent=2, ensure_ascii=False))
        if msg[&quot;resoultCode&quot;] == &quot;0&quot;:
            self.task_list = msg[&quot;data&quot;]
        else:
            print_now(&quot;获取任务列表失败&quot;)
            print_now(msg)
            return

    # 做每日任务
    def do_task(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/paradise/polymerize&quot;
        for task in self.task_list:
            if &quot;翻牌抽好礼&quot; in task[&quot;title&quot;] or &quot;查看我的订单&quot; in task[&quot;title&quot;] or &quot;查看我的云盘&quot; in task[&quot;title&quot;]:
                print_now(f&apos;{task[&quot;title&quot;]}----{task[&quot;taskId&quot;]}&apos;)
                decrept_para = f&apos;{{&quot;phone&quot;:&quot;{self.phone}&quot;,&quot;jobId&quot;:&quot;{task[&quot;taskId&quot;]}&quot;}}&apos;
                data = {
                    &quot;para&quot;: self.telecom_encrypt(decrept_para)
                }
                data = self.req(url, &quot;POST&quot;, data)
                if data[&quot;data&quot;][&quot;code&quot;] == 0:
                    # print(data[&quot;resoultMsg&quot;])
                    print_now(data)
                else:
                    print_now(f&apos;聚合任务完成失败,原因是{data[&quot;resoultMsg&quot;]}&apos;)

    # 给宠物喂食
    def food(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/paradise/food&quot;
        data = {
            &quot;para&quot;: self.telecom_encrypt(f&apos;{{&quot;phone&quot;:{self.phone}}}&apos;)
        }
        res_data = self.req(url, &quot;POST&quot;, data)
        if res_data[&quot;resoultCode&quot;] == &quot;0&quot;:
            print_now(res_data[&quot;resoultMsg&quot;])
        else:
            print_now(f&apos;聚合任务完成失败,原因是{res_data[&quot;resoultMsg&quot;]}&apos;)

    # 查询宠物等级
    def get_level(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/paradise/getParadiseInfo&quot;
        body = {
            &quot;para&quot;: self.telecom_encrypt(f&apos;{{&quot;phone&quot;:{self.phone}}}&apos;)
        }
        data = self.req(url, &quot;POST&quot;, body)
        self.level = int(data[&quot;userInfo&quot;][&quot;paradiseDressup&quot;][&quot;level&quot;])
        if self.level < 5:
            print_now(&quot;当前等级小于5级 不领取等级权益&quot;)
            return
        url = &quot;https://wapside.189.cn:9001/jt-sign/paradise/getLevelRightsList&quot;
        right_list = self.req(url, &quot;POST&quot;, body)[f&quot;V{self.level}&quot;]
        for data in right_list:
            # print(dumps(data, indent=2, ensure_ascii=0))
            if &quot;00金豆&quot; in data[&quot;righstName&quot;] or &quot;话费&quot; in data[&quot;righstName&quot;]:
                rightsId = data[&quot;id&quot;]
                self.level_ex(rightsId)
                continue
        # print(self.rightsId)

    # 每月领取等级金豆
    def level_ex(self, rightsId):
        # self.get_level()
        url = &quot;https://wapside.189.cn:9001/jt-sign/paradise/conversionRights&quot;
        data = {
            &quot;para&quot;: self.telecom_encrypt(f&apos;{{&quot;phone&quot;:{self.phone},&quot;rightsId&quot;:&quot;{rightsId}&quot;}},&quot;receiveCount&quot;:1&apos;)
        }
        print_now(self.req(url, &quot;POST&quot;, data))

    # 查询连续签到天数
    def query_signinfo(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/reward/activityMsg&quot;
        body = {
            &quot;para&quot;: self.telecom_encrypt(f&apos;{{&quot;phone&quot;:{self.phone}}}&apos;)
        }
        data = self.req(url, &quot;post&quot;, body)
        # print(dumps(data, indent=2, ensure_ascii=0))
        recordNum = data[&quot;recordNum&quot;]
        if recordNum != 0:
            return data[&quot;date&quot;][&quot;id&quot;]
        return &quot;&quot;

    # 若连续签到为7天 则兑换
    def convert_reward(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/reward/convertReward&quot;
        try:
            rewardId = self.query_signinfo()  # &quot;baadc927c6ed4d8a95e28fa3fc68cb9&quot;
        except:
            rewardId = &quot;baadc927c6ed4d8a95e28fa3fc68cb9&quot;
        if rewardId == &quot;&quot;:
            return
        body = {
            &quot;para&quot;: self.telecom_encrypt(
                f&apos;{{&quot;phone&quot;:&quot;{self.phone}&quot;,&quot;rewardId&quot;:&quot;{rewardId}&quot;,&quot;month&quot;:&quot;{date.today().__format__(&quot;%Y%m&quot;)}&quot;}}&apos;)
        }
        for i in range(10):
            try:
                data = self.req(url, &quot;post&quot;, body)
            except Exception as e:
                print(f&quot;请求发送失败: &quot; + str(e))
                sleep(6)
                continue
            print_now(data)
            if data[&quot;code&quot;] == &quot;0&quot;:
                break
            sleep(6)
        reward_status = self.get_coin_info()
        if reward_status:
            self.msg += f&quot;账号{self.phone}连续签到7天兑换1元话费成功\n&quot;
            print_now(self.msg)
            push(&quot;电信签到兑换&quot;, self.msg)
        else:
            self.msg += f&quot;账号{self.phone}连续签到7天兑换1元话费失败 明天会继续尝试兑换\n&quot;
            print_now(self.msg)
            push(&quot;电信签到兑换&quot;, self.msg)


    # 查询金豆数量
    def coin_info(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/api/home/userCoinInfo&quot;
        data = {
            &quot;para&quot;: self.telecom_encrypt(f&apos;{{&quot;phone&quot;:{self.phone}}}&apos;)
        }
        self.coin_count = self.req(url, &quot;post&quot;, data)
        print_now(self.coin_count)

    def author(self):
        &quot;&quot;&quot;
        通过usercode 获取 authorization
        :return:
        &quot;&quot;&quot;
        self.get_usercode()
        url = &quot;https://xbk.189.cn/xbkapi/api/auth/userinfo/codeToken&quot;
        data = {
            &quot;usercode&quot;: self.usercode
        }
        data = post(url, headers=self.headers_live, json=data).json()
        self.authorization = f&quot;Bearer {data[&apos;data&apos;][&apos;token&apos;]}&quot;
        self.headers_live[&quot;Authorization&quot;] = self.authorization
    def get_usercode(self):
        &quot;&quot;&quot;
        授权星播客登录获取 usercode
        :return:
        &quot;&quot;&quot;
        url = f&quot;https://xbk.189.cn/xbkapi/api/auth/jump?userID={self.ticket}&version=9.3.3&type=room&l=renwu&quot;
        self.headers_live = {
            &quot;User-Agent&quot;: self.ua,
            &quot;Host&quot;: &quot;xbk.189.cn&quot;,
            &quot;Accept&quot;: &quot;text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8&quot;,
            &quot;Accept-Language&quot;: &quot;zh-CN,zh-Hans;q=0.9&quot;
        }
        location = get(url, headers=self.headers_live, allow_redirects=False).headers[&quot;location&quot;]
        usercode = findall(r&quot;usercode=(.*?)&&quot;, location)[0]
        self.usercode = usercode
    def watch_video(self):
        &quot;&quot;&quot;
        看视频 一天可完成6次
        :return:
        &quot;&quot;&quot;
        url = &quot;https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchVideo&quot;
        data = {
            &quot;articleId&quot;: 3453
        }
        data = post(url, headers=self.headers_live, json=data).json()
        if data[&quot;code&quot;] == 0:
            print(&quot;看小视频15s完成一次&quot;)
        else:
            print(f&quot;完成看小视频15s任务失败, 失败原因为{data[&apos;msg&apos;]}&quot;)
    def like(self):
        &quot;&quot;&quot;
        点赞直播间 可完成5次
        :return:
        &quot;&quot;&quot;
        url = &quot;https://xbk.189.cn/xbkapi/lteration/room/like&quot;
        liveId_list = [1820, 2032, 2466, 2565, 1094, 2422, 1858, 2346]
        shuffle(liveId_list)
        for liveId in liveId_list[:5]:
            data = {
                &quot;account&quot;: self.phone,
                &quot;liveId&quot;: liveId
            }
            try:
                data = post(url, headers=self.headers_live, json=data).json()
                if data[&quot;code&quot;] == 8888:
                    sleep(2)
                    print(data[&quot;msg&quot;])
                else:
                    print(f&quot;完成点赞直播间任务失败,原因是{data[&apos;msg&apos;]}&quot;)
            except Exception:
                print(Exception)
    def watch_live(self):
        # 首先初始化任务,等待15秒倒计时后再完成 可完成10次
        url = &quot;https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchLiveInit&quot;
        live_id = randint(1000, 2700)
        data = {
            &quot;period&quot;: 1,
            &quot;liveId&quot;: live_id
        }
        data = post(url, headers=self.headers_live, json=data).json()
        if data[&quot;code&quot;] == 0:
            taskcode = data[&quot;data&quot;]
            url = &quot;https://xbk.189.cn/xbkapi/lteration/liveTask/index/watchLive&quot;
            data = {
                &quot;key&quot;: taskcode,
                &quot;period&quot;: 1,
                &quot;liveId&quot;: live_id
            }
            print(&quot;正在等待15秒&quot;)
            sleep(15)
            data = post(url, headers=self.headers_live, json=data).json()
            if data[&quot;code&quot;] == 0:
                print(&quot;完成1次观看直播任务&quot;)
            else:
                print(f&quot;完成观看直播任务失败,原因是{data[&apos;msg&apos;]}&quot;)
        else:
            print(f&quot;初始化观看直播任务失败，失败原因为{data[&apos;msg&apos;]}&quot;)

    def get_userid(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/api/home/homeInfo&quot;
        body = {
            &quot;para&quot;: self.telecom_encrypt(f&apos;{{&quot;phone&quot;:&quot;{self.phone}&quot;,&quot;signDate&quot;:&quot;{datetime.now().__format__(&quot;%Y-%m&quot;)}&quot;}}&apos;)
        }
        userid = post(url, json=body).json()[&quot;data&quot;][&quot;userInfo&quot;][&quot;userThirdId&quot;]
        return userid
    def share(self):
        &quot;&quot;&quot;
        50的分享任务 token不做校检 有值即可 若登录成功了 使用自己的token 否则生成随机的token
        :return:
        &quot;&quot;&quot;
        url = &quot;https://appfuwu.189.cn:9021/query/sharingGetGold&quot;
        body = {
            &quot;headerInfos&quot;: {
                &quot;code&quot;: &quot;sharingGetGold&quot;,
                &quot;timestamp&quot;: datetime.now().__format__(&quot;%Y%m%d%H%M%S&quot;),
                &quot;broadAccount&quot;: &quot;&quot;,
                &quot;broadToken&quot;: &quot;&quot;,
                &quot;clientType&quot;: &quot;#9.6.1#channel50#iPhone 14 Pro Max#&quot;,
                &quot;shopId&quot;: &quot;20002&quot;,
                &quot;source&quot;: &quot;110003&quot;,
                &quot;sourcePassword&quot;: &quot;Sid98s&quot;,
                &quot;token&quot;: self.token if self.token != &quot;&quot; else self.geneRandomToken(),
                &quot;userLoginName&quot;: self.phone
            },
            &quot;content&quot;: {
                &quot;attach&quot;: &quot;test&quot;,
                &quot;fieldData&quot;: {
                    &quot;shareSource&quot;: &quot;3&quot;,
                    &quot;userId&quot;: self.get_userid(),
                    &quot;account&quot;: TelecomLogin.get_phoneNum(self.phone)
                }
            }
        }
        headers = {
            &quot;user-agent&quot;: &quot;iPhone 14 Pro Max/9.6.1&quot;
        }
        data = post(url, headers=headers, json=body).json()
        print_now(data)
    def main(self):
        self.init()
        self.chech_in()
        self.get_task()
        self.do_task()
        if foods != 0:
            for i in range(foods):
                self.food()
        # self.convert_reward()
        if datetime.now().day == 1:
            self.get_level()
        self.share()
        if self.ticket != &quot;&quot;:
            self.author()
            for i in range(6):
                self.watch_video()
                sleep(15)
            self.like()
            for i in range(10):
                try:
                    self.watch_live()
                except:
                    continue
        self.coin_info()
        self.msg += f&quot;你账号{self.phone} 当前有金豆{self.coin_count[&apos;totalCoin&apos;]}&quot;
        push(&quot;电信app签到&quot;, self.msg)
    def get_coin_info(self):
        url = &quot;https://wapside.189.cn:9001/jt-sign/api/getCoinInfo&quot;
        decrept_para = f&apos;{{&quot;phone&quot;:&quot;{self.phone}&quot;,&quot;pageNo&quot;:0,&quot;pageSize&quot;:10,type:&quot;1&quot;}}&apos;
        data = {
            &quot;para&quot;: self.telecom_encrypt(decrept_para)
        }
        data = self.req(url, &quot;POST&quot;, data)
        if &quot;skuName&quot; in data[&quot;data&quot;][&quot;biz&quot;][&quot;results&quot;][0] and &quot;连续签到&quot; in data[&quot;data&quot;][&quot;biz&quot;][&quot;results&quot;][0][&quot;skuName&quot;]:
            return True
        return False

# 主方法与源文件不同；增加了多账号的判断；变量格式如下
# TELECOM       13311111111@111111@10&13322222222@222222@10
if __name__ == &quot;__main__&quot;:
    TELECOM = get_environ(&quot;TELECOM&quot;)
    users = TELECOM.split(&quot;&&quot;)
    for i in range(len(users)):
        user = users[i].split(&quot;@&quot;)
        phone = user[0]
        password = user[1]
        foods = int(float(user[2]))
        print(phone,password,foods)
        if phone == &quot;&quot;:
            exit(0)
        if password == &quot;&quot;:
            print_now(&quot;电信服务密码未提供 只执行部分任务&quot;)
        
        if datetime.now().hour + (8 - int(strftime(&quot;%z&quot;)[2])) == 12:
            telecom = ChinaTelecom(phone, password, False)
            telecom.init()
            telecom.convert_reward()
        else:
            telecom = ChinaTelecom(phone, password)
            telecom.main()
