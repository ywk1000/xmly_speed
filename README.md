#  喜马拉雅单独仓库脚本

## 此仓库为单独喜马拉雅仓库脚本与主仓库脚本相同（可能不同？），使用的脚本为whyour大佬改写的带自动提现功能的脚本，并在此基础上进行调整

> 本代码仅限讨论交流，严禁进行商业活动或其他侵害他人利益的行为，严禁对本仓库直接fork运行。个人行为与作者无关，违规行为将对其追究责任。

## 本仓库使用应该进行以下步骤：

### 1. 仓库同步教程[点击查看](backup/reposync.md)

### 2. 抓取相应cookie.

### 3. 配置环境变量

### 4. run it!

## 喜马拉雅极速版环境变量说明

| Secrets              |                             说明                                  | 
| -------------------- | :----------------------------------------------------------:      |
| XMLY_SPEED_COOKIE    |            必须   cookie 多账号换行粘贴                            |
| AUTO_TAKE_OUT        |           非必须  是否自动提现支付宝20，默认不自动                   | 
| XMLY_ANDROID_AGENT   |           非必须  自定义useragent，默认自带agent                    |
| XMLY_ACCUMULATE_TIME |    非必须  自定义是否刷时长，默认1(即刷时长)，反之设置为0             |
| NOTIFY_TIME          | 非必须  自定义通知时间 输入1~24的数字代表相应小时，默认23即23点通知    |
| BARK                 |                       非必须 bark通知                              |
| SCKEY                |                     非必须 server酱通知                            |
| TG_BOT_TOKEN         |                     非必须 tg机器人token                           |
| TG_USER_ID           |                    非必须 tg机器人userId                           |
| DD_BOT_ACCESS_TOKEN  |                    非必须 钉钉机器人token                          |
| DD_BOT_SECRET        |                   非必须 钉钉机器人secret                          |
| PUSH_PLUS_TOKEN      |                    非必须 PushPlus token                          |
| PUSH_PLUS_USER       |                   非必须 PushPlus 群组编码                         |

