#!/bin/bash

# 应用ID
Appid=wxd591cb1a25239ea2

# 企业ID
Grant_type=client_credential

# 密钥
Secret=886749780076fafa0a406129950c8f1e

# get请求获取token
GURL="https://api.weixin.qq.com/cgi-bin/token?grant_type=$Grant_type&appid=$Appid&secret=$Secret"
token=$(/usr/bin/curl -s -G $GURL | awk -F \" '{print $4}')

# 请求内容，注意是json格式
body='{
   "filter":{"is_to_all":true},
   "msgtype":"text",
   "text":{"content": "注意事项：
   1、每天早上9：30自动开始学习，完成学习后会提示“今日得分”
   2、每日学习可得45分，剩余学分需要自己手动完成
   3、由于账号登录有效时间为一天，建议每天早上9：30之前点击“今日积分”查看账号是否正常登录。正常登录的账号会提示“今日得分”，不正常的账号会弹出“点击登录”，登录正常后自动开始学习。
   4、当点击“开始学xi”提示登录账号失效时说明账号登录已经过期，请点击“今日积分”重新登录后开始学xi "}
}'

PURL="https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=$token"

# post发送消息
/usr/bin/curl --data-ascii "$body" $PURL
