/**
 *
 * 项目类型：APP
 * 项目名称：抖音极速版
 * 项目更新：2023-08-18
 * 项目抓包：抓api5-normal-c-lq.amemv.com下的宝箱url#cookie#x-argus#x-ladon#user-agent填入变量
 * 项目变量：lekebo_dyjsb_Cookie
 * 项目定时：每30分钟运行一次
 * 定时规则: * 25 0-23 * * *
 *
 * 版本功能: 签到、宝箱、步数、广告、刷视频，后期会完善待增加的功能
 *
 * 更新内容: 增加多个追加广告，更新停止看广告控制功能，修复广告显示错误
 *
 */

const $ = new Env("抖音极速版");
//-------------------- 一般不动变量区域 -------------------------------------
const notify = $.isNode() ? require("./sendNotify") : "";
const CryptoJS = require("crypto-js");
const Notify = 0;		      //通知设置      0关闭  1开启
let debug = 0;                //Debug调试     0关闭  1开启
let envSplitor = ["@", "\n"]; //多账号分隔符
let ck = msg = '';            //let ck,msg
let versionupdate = "0";      //版本对比升级   0关闭  1开启
let stoptask = "0";           //停止看广告开关，为防止黑号设备   0关闭  1开启
let stopcombine = "0";        //并发加速看广告   0关闭  1开启   暂时没增此功能
//===============脚本版本=================//
let scriptVersion = "v3.0";
let update_tines = "2023-08-27";
let update_data = "2023-12-12";   //测试时间
let scriptVersionLatest = "v3.0"; //版本对比
let userCookie = ($.isNode() ? process.env.dyjsb : $.getdata('dyjsb')) || '';
let userList = [];
let userIdx = 0;
let date = require('silly-datetime');
let signTime = date.format(new Date(),'YYYY-MM-DD');
let timeHours = parseInt($.time('HH'));
let times = Math.round(new Date().getTime() / 1000).toString();  //10位时间戳
let timestamp = Math.round(new Date().getTime()).toString();     //13位时间戳
let host = 'api3-normal-c.amemv.com';
let hostname = 'http://' + host;
//---------------------- 自定义变量区域 -----------------------------------
async function start() {
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.getMemberInfo(2 * 1000));
        await $.wait(1000);
        taskall.push(await user.invitation(2 * 1000));
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 查询账号收益变动 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.getMemberScore(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 执行账号签到赚钱 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.signin(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 执行账号走路赚金 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.step(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 执行开宝箱赚金币 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.treasure(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 执行看广告赚金币 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.video(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 执行账号吃饭赚金 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.doneeat(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 执行逛街浏览赚钱 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.shopping(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 执行天天领金视频 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.ecom(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    DoubleLog(`\n================ 执行观看同城视频 ================`)
    taskall = [];
    for (let user of userList) {
        taskall.push(await user.read(2 * 1000));
        await $.wait(1000);
    }
    await Promise.all(taskall);
    // DoubleLog(`\n================ 执行观看同城视频 ================`)
    // taskall = [];
    // for (let user of userList) {
    //     taskall.push(await user.profit(2 * 1000));
    //     await $.wait(1000);
    // }
    // await Promise.all(taskall);
}

class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split('#');
    }
// ============================================执行项目============================================ \\
    async getMemberInfo(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/aweme/v1/user/profile/self/?${this.ck[0]}`,
                headers: {
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = isJSON(data);
                        if (result == true) {
                            let result = JSON.parse(data);
                            if (result.status_code == 0) {
                                DoubleLog(`\n ✅ 【${this.index}】用户信息: ${result.user.bind_phone}，${result.user.nickname}`)
                            } else {
                                DoubleLog(`\n ❌ 【${this.index}】用户信息: ${result.err_tips}`)
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】用户信息: 无法找到该CK的用户信息`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async getMemberScore(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/page?${this.ck[0]}`,
                headers: {
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】金币收益: 今日收入${result.data.income_data.amount1}金币,余额${result.data.income_data.amount2 / 100}元`)
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】金币收益: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async invitation(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/post_invite_code?${this.ck[0]}`,
                headers: {
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"in_sp_time":0,"invite_code":"8819289331"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                        } else {
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async signin(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/page?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            if(result.data.task_list && Array.isArray(result.data.task_list)) {
                                for(let i=0; i < result.data.task_list.length; i++) {
                                    let taskItem = result.data.task_list[i];
                                    if(taskItem.task_id == "203") {
                                        if(taskItem.completed == true) {
                                            DoubleLog(`\n ❌ 【${this.index}】签到信息: 今天已签到，已连续签到 ${taskItem.action_times} 天`)
                                        } else {
                                            await this.opensign(2 * 1000);
                                        }
                                    }
                                }
                            } else {
                                DoubleLog(`\n ❌ 【${this.index}】任务列表: 没有找到任务相关列表`)
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】任务列表: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async opensign(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/sign_in?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】签到成功: 获得奖励 ${result.data.amount} 金币`);
                            await this.open_sign_ad(2 * 1000);
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】签到失败: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async open_sign_ad(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/sign_in/detail?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            let adid = result.data.excitation_ad_info.ad_id
                            let reqid = result.data.excitation_ad_info.req_id
                            let amount = result.data.excitation_ad_info.score_amount
                            DoubleLog(`\n ✅ 【${this.index}】签到广告: 预计可获得 ${result.data.excitation_ad_info.score_amount} 金币`);
                            await this.signin_video(adid,reqid,amount,2 * 1000);
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】签到失败: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async signin_video(adid,reqid,amount,timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/lite/v1/eat/done_eat/${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"task_key":"excitation_ad_signin","amount":"${amount}","ad_rit":"${adid}","ad_inspire":"{"score_amount":"${amount}","amount":"${amount}","req_id":"${reqid}"}","ad_alias_position":"check_in","timeout":4000}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = isJSON(data);
                        if (result == true) {
                            await $.wait(1000);
                            let result = JSON.parse(data);
                            if (result.err_no == 0) {
                                DoubleLog(`\n ✅ 【${this.index}】签到广告: 获得奖励 ${result.data.amount} 金币`);
                            } else {
                                await this.signin_video(adid,reqid,amount,2 * 1000);
                            }
                        } else {
                            await $.wait(1000);
                            await this.signin_video(adid,reqid,amount,2 * 1000);
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async step(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/walk/page?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            if (timeHours > 0) {
                                if (result.data.today_step > 0) {
                                    DoubleLog(`\n ✅ 【${this.index}】今日步数: 今日步数:${result.data.today_step}步，已领取${result.data.today_step_reward.reward_amount}金币`);
                                    if (result.data.today_step_reward.reward_amount == 0) {
                                        await this.step_reward(2 * 1000);
                                    }
                                } else {
                                    await this.step_submit(2 * 1000);
                                }
                            } else {
                                DoubleLog(`\n ❌ 【${this.index}】今日步数: 当前时间为系统结算期,暂不做操作。`);
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】今日步数: ${result.err_tips}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async step_submit(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/walk/step_submit?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"step":${parseInt((20000 + Math.random() * 10000) + "")},"submit_time":${parseInt((new Date().getTime() / 1000) + "")}}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】上传步数: 今日提交步数：${result.data.today_step} 步`);
                            await this.step_reward(2 * 1000);
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】上传步数: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async step_reward(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/walk/receive_step_reward?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"in_sp_time":0}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】步数奖励: 获得奖励 ${result.data.reward_amount} 金币`);
                            await this.step_video(2 * 1000);
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】步数奖励: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async step_video(aggrincomeid,timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad/one_more?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"task_key":"walk_excitation_ad","rit":"28038","creator_id":"12317000","one_more_round":0,"aggr_income_id":"${aggrincomeid}"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = isJSON(data);
                        if (result == true) {
                            await $.wait(1000);
                            let result = JSON.parse(data);
                            if (result.err_no == 0) {
                                DoubleLog(`\n ✅ 【${this.index}】步数视频: 获得奖励 ${result.data.amount} 金币`);
                            } else {
                                await this.step_video(aggrincomeid,2 * 1000);
                            }
                        } else {
                            await $.wait(1000);
                            await this.step_video(aggrincomeid,2 * 1000);
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async read(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/read?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'x-ss-req-ticket': timestamp,
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"hidden_status":1,"is_user_active":false,"widget_style":"default","has_alipay":"1","pendant_show_scene":"feed_recommend","is_incentive_page_to_feed":false,"read_task_public_welfare_status":-1,"read_public_welfare_group":-1,"task_id":0,"task_key":"","is_click_icon":false}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】刷小视频: 获得奖励 ${result.data.score_amount} 金币`);
                        } else if (result.err_no == 10009) {
                            DoubleLog(`\n ❌ 【${this.index}】刷小视频: 视频时间未达到或设备问题`);
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】刷小视频: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async treasure(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/page?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            let cur_time = result.data.treasure_box.treasure_stats.cur_time;
                            let next_time = result.data.treasure_box.treasure_stats.next_time;
                            if (next_time <= cur_time) {
                                DoubleLog(`\n ✅ 【${this.index}】打开宝箱: 正在执行获取宝箱任务请等待...`);
                                await $.wait(1000);
                                await this.open_treasure(2 * 1000);
                            } else {
                                DoubleLog(`\n ❌ 【${this.index}】打开宝箱: 下次开宝箱：${$.time('yyyy-MM-dd HH:mm:ss', next_time * 1000)}`);
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】宝箱广告: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async open_treasure(timeout = 2000) {
        return new Promise((resolve) => {
            this.stopfor = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/treasure_task?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            let treasureamount = result.data.excitation_ad_info.score_amount;
                            let treasureadid = result.data.excitation_ad_info.ad_id;
                            let treasurereqid = result.data.excitation_ad_info.req_id;
                            DoubleLog(`\n ✅ 【${this.index}】打开宝箱: 获得奖励 ${result.data.amount} 金币`);
                            await $.wait(1000);
                            if (stoptask == 1) {
                                if (treasureamount > 19) {
                                    DoubleLog(`\n ✅ 【${this.index}】宝箱广告: 预计可获得 ${treasureamount} 金币，正在执行`);
                                    await $.wait(1000);
                                    await this.treasure_video(treasureamount,treasureadid,treasurereqid,2 * 1000);
                                } else {
                                    DoubleLog(`\n ❌ 【${this.index}】打开宝箱: 防止黑号，此账号停止看广告`);
                                }
                            } else {
                                DoubleLog(`\n ✅ 【${this.index}】宝箱广告: 预计可获得 ${treasureamount} 金币，正在执行`);
                                await $.wait(1000);
                                await this.treasure_video(treasureamount,treasureadid,treasurereqid,2 * 1000);
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】打开宝箱: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async treasure_video(treasureamount,treasureadid,treasurereqid,timeout = 2000) {
        return new Promise((resolve) => {
            this.forstop = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad_treasure_box?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"amount":"${treasureamount}","inspire_modal_add_modal_manage":false,"ad_rit":"${treasureadid}","task_key":"excitation_ad_treasure_box","ad_alias_position":"box","need_reward":true,"params_for_special":"luckydog_sdk","static_settings_version":51,"dynamic_settings_version":51,"poll_settings_version":0,"aggr_income_id":""}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            this.stopfor = 1;
                            DoubleLog(`\n ✅ 【${this.index}】宝箱广告: 获得奖励 ${result.data.amount} 金币，执行宝箱追加任务`);
                            await $.wait(1000);
                            await this.treasure_video_status(result.data.aggr_info.aggr_income_id,2 * 1000);
                            await $.wait(1000);
                            await this.treasure_video_append(result.data.aggr_info.aggr_income_id,2 * 1000);
                            await $.wait(1000);
                            await this.treasure_video_chase(result.data.aggr_info.aggr_income_id,2 * 1000);
                        } else {
                            await $.wait(1000);
                            await this.treasure_video(treasureamount,treasureadid,treasurereqid,2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.treasure_video(treasureamount,treasureadid,treasurereqid,2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async treasure_video_status(aggrincomeid,timeout = 2000) {
        return new Promise((resolve) => {
            this.forzstop = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad/one_more?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"task_key":"excitation_ad_treasure_box","rit":"28038","creator_id":"12317000","one_more_round":0,"aggr_income_id":"${aggrincomeid}"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】宝箱追加: 获得奖励 ${result.data.amount} 金币`);
                        } else {
                            await $.wait(1000);
                            await this.treasure_video_status(aggrincomeid,2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.treasure_video_status(aggrincomeid,2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async treasure_video_append(aggrincomeid,timeout = 2000) {
        return new Promise((resolve) => {
            this.forzstop = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad/one_more?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"task_key":"excitation_ad_treasure_box","rit":"28038","creator_id":"12317000","one_more_round":1,"aggr_income_id":"${aggrincomeid}"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】宝箱二追: 获得奖励 ${result.data.amount} 金币`);
                        } else {
                            await $.wait(1000);
                            await this.treasure_video_status(aggrincomeid,2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.treasure_video_status(aggrincomeid,2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async treasure_video_chase(aggrincomeid,timeout = 2000) {
        return new Promise((resolve) => {
            this.forzstop = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad/one_more?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"task_key":"excitation_ad_treasure_box","rit":"28038","creator_id":"12317000","one_more_round":2,"aggr_income_id":"${aggrincomeid}"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】宝箱三追: 获得奖励 ${result.data.amount} 金币`);
                        } else {
                            await $.wait(1000);
                            await this.treasure_video_status(aggrincomeid,2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.treasure_video_status(aggrincomeid,2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async video(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/page?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            if(result.data.task_list && Array.isArray(result.data.task_list)) {
                                for(let i=0; i < result.data.task_list.length; i++) {
                                    let taskItem = result.data.task_list[i];
                                    if (taskItem.task_id == "111") {
                                        let tasklist = JSON.parse(taskItem.status_extra);
                                        if(tasklist.completed == true) {
                                            if (typeof tasklist.tpl != "undefined") {
                                                DoubleLog(`\n ❌ 【${this.index}】广告赚金: 距离下一次广告还剩：${$.time('mm:ss', tasklist.tpl.countdown.value)} 秒`)
                                            } else {
                                                DoubleLog(`\n ❌ 【${this.index}】广告赚金: 距离下一次广告还剩：${$.time('mm:ss', tasklist.tpl.countdown.value)} 秒`)
                                            }
                                        } else {
                                            await this.open_video(tasklist.ad_id,tasklist.req_id,2 * 1000);
                                        }
                                    }
                                }
                            } else {
                                DoubleLog(`\n ❌ 【${this.index}】任务列表: 没有找到任务相关列表`)
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】任务列表: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async open_video(adid,reqid,timeout = 2000) {
        return new Promise((resolve) => {
            this.stopvfor = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/excitation_ad/detail?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            if (stoptask == 1) {
                                if (result.data.score_amount > 19) {
                                    DoubleLog(`\n ✅ 【${this.index}】广告赚金: 执行看广告，预计获得 ${result.data.score_amount} 金币`);
                                    await $.wait(1000);
                                    await this.open_video_stop(adid,reqid,result.data.score_amount,2 * 1000);
                                } else {
                                    DoubleLog(`\n ❌ 【${this.index}】广告赚金: 防止黑号，此账号停止看广告`);
                                }
                            } else {
                                DoubleLog(`\n ✅ 【${this.index}】广告赚金: 执行看广告，预计获得 ${result.data.score_amount} 金币`);
                                await $.wait(1000);
                                await this.open_video_stop(adid,reqid,result.data.score_amount,2 * 1000);
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】打开广告: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async open_video_stop(adid,reqid,amount,timeout = 2000) {
        return new Promise((resolve) => {
            this.forvstop = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'x-ss-req-ticket': timestamp,
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"amount":"${amount}","inspire_modal_add_modal_manage":false,"ad_rit":"${adid}","ad_inspire":"{\"score_amount\":\"${amount}\",\"experience\":\"-1\",\"req_id\":\"${reqid}\"}","task_key":"excitation_ad","stage_score_amount":[],"ad_alias_position":"task","need_reward":true,"experience":"-1","params_for_special":"luckydog_sdk","static_settings_version":51,"dynamic_settings_version":51,"poll_settings_version":0,"aggr_income_id":""}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            this.stopvfor = 1;
                            this.aggrinfoid = result.data.aggr_info.aggr_income_id;
                            DoubleLog(`\n ✅ 【${this.index}】视频广告: 获得奖励 ${result.data.amount} 金币`);
                            await this.video_more_status(2 * 1000);
                        } else {
                            await $.wait(1000);
                            await this.open_video_stop(adid,reqid,amount,2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.open_video_stop(adid,reqid,amount,2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async video_more_status(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/excitation_ad/one_more/detail?task_key=excitation_ad&rit=28038&creator_id=12315000&one_more_round=0&${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】广告追加: 执行追加广告，预计获得 ${result.data.amount} 金币`);
                            await this.one_moread(result.data.aggr_income_id,2 * 1000);
                            await $.wait(1000);
                            await this.two_moread(result.data.aggr_income_id,2 * 1000);
                            await $.wait(1000);
                            await this.three_moread(result.data.aggr_income_id,2 * 1000);
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async one_moread(aggrincomeid,timeout = 2000) {
        return new Promise((resolve) => {
            this.forvzstop = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad/one_more?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"task_key":"excitation_ad","rit":"28038","creator_id":"12315000","one_more_round":0,"aggr_income_id":"${aggrincomeid}"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】追加奖励: 获得奖励 ${result.data.amount} 金币`);
                        } else {
                            await $.wait(1000);
                            await this.one_moread(aggrincomeid,2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.one_moread(aggrincomeid,2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async two_moread(aggrincomeid,timeout = 2000) {
        return new Promise((resolve) => {
            this.forvzstop = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad/one_more?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"task_key":"excitation_ad","rit":"28038","creator_id":"12315000","one_more_round":1,"aggr_income_id":"${aggrincomeid}"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】追加奖励: 获得奖励 ${result.data.amount} 金币`);
                        } else {
                            await $.wait(1000);
                            await this.one_moread(aggrincomeid,2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.one_moread(aggrincomeid,2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async three_moread(aggrincomeid,timeout = 2000) {
        return new Promise((resolve) => {
            this.forvzstop = 0;
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/excitation_ad/one_more?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"task_key":"excitation_ad","rit":"28038","creator_id":"12315000","one_more_round":2,"aggr_income_id":"${aggrincomeid}"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】追加奖励: 获得奖励 ${result.data.amount} 金币`);
                        } else {
                            await $.wait(1000);
                            await this.one_moread(aggrincomeid,2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.one_moread(aggrincomeid,2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async shopping(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/page?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.useragent,
                    'Cookie': 'sessionid=' + this.sessionid,
                    'X-Gorgon': this.gorgon,
                    'X-Khronos': times,
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            if(result.data.task_list && Array.isArray(result.data.task_list)) {
                                for(let i=0; i < result.data.task_list.length; i++) {
                                    let taskItem = result.data.task_list[i];
                                    if (taskItem.task_id == "1334") {
                                        let extra = JSON.parse(taskItem.status_extra);
                                        if(extra.tpl.countdown.value > 0) {
                                            DoubleLog(`\n ❌ 【${this.index}】逛街赚钱: 距离下一次执行还剩：${$.time('mm:ss', extra.tpl.countdown.value)} 分钟`);
                                        } else {
                                            await this.openshopping(2 * 1000);
                                        }
                                    }
                                }
                            } else {
                                DoubleLog(`\n ❌ 【${this.index}】逛街赚钱: 没有找到任务相关列表`)
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】逛街赚钱: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async openshopping(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/shopping_gold?mode=init&${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `body=null`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            if (result.data.status == 1) {
                                DoubleLog(`\n ❌ 【${this.index}】逛街赚钱: ${result.data.reward_text}`);
                            } else {
                                DoubleLog(`\n ✅ 【${this.index}】逛街赚钱: 预计获得 ${result.data.amount} 金币`);
                                await this.shopping_gold(2 * 1000);
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】逛街赚钱: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async shopping_gold(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/shopping_gold?mode=done&${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Cookie': this.ck[1],
                    'x-argus': this.ck[2],
                    'x-ladon': this.ck[3],
                    'user-agent': this.ck[4],
                },
                body: `body=null`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            if (result.data.status == 1) {
                                DoubleLog(`\n ❌ 【${this.index}】逛街奖励: ${result.data.reward_text}`)
                            } else {
                                DoubleLog(`\n ✅ 【${this.index}】逛街奖励: 获得奖励 ${result.data.amount} 金币`);
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】逛街奖励: ${result.msg}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async doneeat(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `https://minigame.zijieapi.com/ttgame/meal/settings?${this.ck[0]}`,
                headers: {
                    'Host': 'minigame.zijieapi.com',
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.code == 0) {
                            if (timeHours > 5 && timeHours < 9) {
                                DoubleLog(`\n ✅ 【${this.index}】吃饭打卡: 该时间为早餐段，执行早餐任务`);
                                await $.wait(1000);
                                await this.open_doneeat(0,2 * 1000);
                            } else if (timeHours > 11 && timeHours < 14) {
                                DoubleLog(`\n ✅ 【${this.index}】吃饭打卡: 该时间为午餐段，执行午餐任务`);
                                await $.wait(1000);
                                await this.open_doneeat(1,2 * 1000);
                            } else if (timeHours > 17 && timeHours < 19) {
                                DoubleLog(`\n ✅ 【${this.index}】吃饭打卡: 该时间为晚餐段，执行晚餐任务`);
                                await $.wait(1000);
                                await this.open_doneeat(2,2 * 1000);
                            } else if (timeHours > 21 && timeHours < 23) {
                                DoubleLog(`\n ✅ 【${this.index}】吃饭打卡: 该时间为夜宵段，执行夜宵任务`);
                                await $.wait(1000);
                                await this.open_doneeat(3,2 * 1000);
                            } else {
                                DoubleLog(`\n ❌ 【${this.index}】吃饭打卡: 该时间段不在指定任务当中`);
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】吃饭补贴: ${result.message}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async open_doneeat(timeid,timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `https://minigame.zijieapi.com/ttgame/meal/check_in?${this.ck[0]}`,
                headers: {
                    'Host': 'minigame.zijieapi.com',
                    'Connection': 'Keep-Alive',
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"meal_index":${timeid}}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.code == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】吃饭打卡: 获得 ${result.data.reward} 金币,看视视预计 ${result.data.excitation_ad_amount} 金币`);
                            await this.doneeat_video(2 * 1000);
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】吃饭补贴: ${result.message}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async doneeat_video(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/task/done/meal_excitation_ad?${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Connection': 'Keep-Alive',
                    'Content-Type': 'application/json; charset=utf-8',
                    'User-Agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-argus': this.ck[2],
                    'x-ladon': this.ck[3],
                },
                body: `{"amount":"1200","ad_rit":"12320","task_key":"meal_excitation_ad","ad_alias_position":"sleep_ad","need_reward":true,"params_for_special":"luckydog_sdk","static_settings_version":51,"dynamic_settings_version":51,"poll_settings_version":0,"aggr_income_id":""}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = isJSON(data);
                        if (result == true) {
                            await $.wait(1000);
                            let result = JSON.parse(data);
                            if (result.err_no == 0) {
                                DoubleLog(`\n ✅ 【${this.index}】吃饭视频: 获得奖励 ${result.data.amount} 金币`);
                            } else {
                                await $.wait(1000);
                                await this.doneeat_video(2 * 1000);
                            }
                        } else {
                            await $.wait(1000);
                            await this.doneeat_video(2 * 1000);
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async ecom(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/aweme/lite/v1/ecom/newbie_channel/get_head?request_tag_from=lynx&enter_from=task_page&${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            if(result.data.gold_info.bubbles && Array.isArray(result.data.gold_info.bubbles)) {
                                for(let i=0; i < result.data.gold_info.bubbles.length; i++) {
                                    let taskItem = result.data.gold_info.bubbles[i];
                                    if (taskItem.key == "ecom_newbie_timing_bubble") {
                                        if (taskItem.status == 1) {
                                            DoubleLog(`\n ❌ 【${this.index}】天天领金: ${taskItem.bottom_text}`)
                                        } else {
                                            DoubleLog(`\n ✅ 【${this.index}】天天领金: 今天可领 ${taskItem.reward} 金币，执行领金`);
                                            await this.open_ecom(2 * 1000);
                                        }
                                    }
                                }
                            }
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】天天领金: ${result.msg}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async open_ecom(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/aweme/lite/v1/ecom/newbie_channel/done_bubble_task?task_key=ecom_newbie_timing_bubble&${this.ck[0]}`,
                headers: {
                    Host: host,
                    'Content-Type': 'application/json; charset=utf-8',
                    'Cookie': this.ck[1],
                    'x-argus': this.ck[2],
                    'x-ladon': this.ck[3],
                    'user-agent': this.ck[4],
                },
                body: `{}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    let result = isJSON(data);
                    if (result == true) {
                        await $.wait(1000);
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                            DoubleLog(`\n ✅ 【${this.index}】天天领金: 获得奖励 ${result.data.amount} 金币`);
                        } else {
                            await $.wait(1000);
                            await this.open_ecom(2 * 1000);
                        }
                    } else {
                        await $.wait(1000);
                        await this.open_ecom(2 * 1000);
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async profit(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/wallet/profit_detail_page?income_type=1&offset=0&num=50&share_page=profits_detail_page&key=coin&${this.ck[0]}`,
                headers: {
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
            }
            $.get(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        console.log(result)
                        if (result.err_no == 0) {
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】用户信息: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
    async withdraw(timeout = 2000) {
        return new Promise((resolve) => {
            let url = {
                url: `${hostname}/luckycat/aweme/v1/wallet/take_cash?${this.ck[0]}`,
                headers: {
                    'Content-Type': 'application/json',
                    'user-agent': this.ck[4],
                    'Cookie': this.ck[1],
                    'x-ladon': this.ck[3],
                    'x-argus': this.ck[2],
                },
                body: `{"is_auto":false,"take_cash_type":3,"cash_amount":-1500,"tab_type":"alipay","name":"","account":"180******16"}`,
            }
            $.post(url, async (error, response, data) => {
                try {
                    if (error) {
                        $.logErr(error);
                    } else {
                        let result = JSON.parse(data);
                        if (result.err_no == 0) {
                        } else {
                            DoubleLog(`\n ❌ 【${this.index}】用户信息: ${result.err_tips}`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, response);
                } finally {
                    resolve();
                }
            }, timeout)
        })
    }
}
// ============================================结束项目============================================ \\
!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
    console.log(`\n================ 共找到 ${userList.length} 个账号 ================ \n\n 脚本执行✌北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000).toLocaleString()} `);
        if (versionupdate == 1) {
            await getVersion();
            console.log(`\n================ 版本对比检查更新 ===============`)
            if (scriptVersionLatest != scriptVersion) {
                console.log(`\n 当前版本：${scriptVersion}，更新时间：${update_tines}`)
                console.log(`\n 最新版本：${scriptVersionLatest}`)
                console.log(`\n 更新信息：${update_data}`)
            } else {
                console.log(`\n 版本信息：${scriptVersion} ，已是最新版本无需更新开始执行脚本`)
            }
        } else {
            console.log(`\n================ 版本对比检查更新 ===============`)
            console.log(`\n 当前版本:${scriptVersion}，更新时间:${update_tines}，已设不更新版本`);
        }
        console.log(`\n================ 开始执行会员脚本 ===============`)
        await start();
    }
    console.log(`\n================ 本次运行脚本结束 ===============`);
    //await SendMsg(msg);
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());
// ============================================变量检查============================================ \\
async function checkEnv() {
    if (userCookie) {
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
        userCount = userList.length;
    } else {
        console.log(`\n\n 温馨提示：您没有建立系统变量或者没填写参数\n\n`);
        return;
    }
    return true;
}
// ============================================获取远程版本============================================ \\
function getVersion(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://ghproxy.com/https://raw.githubusercontent.com/qq274023/lekebo/master/lekebo_dyjsb.js`,
        }
        $.get(url, async (err, resp, data) => {
            try {
                scriptVersionLatest = data.match(/scriptVersion = "([\d\.]+)"/)[1]
                update_data = data.match(/update_data = "(.*?)"/)[1]
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        }, timeout)
    })
}
// ============================================项目所需参数============================================ \\
function isJSON(str) {
    if (typeof str == 'string') {
        try {
            let obj = JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }
        } catch(e) {
            return false;
        }
    }
    console.log(`\n ❌ 温馨提示：访问返回了空数组，跳出该次任务`);
}
/**
 * 随机 数字 + 大写字母 生成
 */
function randomString(e) {
    e = e || 32;
    var t = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}
/**
 * 随机 数字 + 小写字母 生成
 */
function randomsstring(e, t = "abcdefhijkmnprstwxyz123456789") {
    e = e || 32;
    let a = t.length,
        n = "";
    for (let i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}
function randomNum(min, max) {
    if (arguments.length === 0) return Math.random()
    if (!max) max = 10 ** (Math.log(min) * Math.LOG10E + 1 | 0) - 1
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function getTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear(),
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
        D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()),
        h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()),
        m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()),
        s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s
}
// ============================================结束项目所需参数============================================ \\
function DoubleLog(data) { if ($.isNode()) { if (data) { console.log(`${data}`); msg += `${data}` } } else { console.log(`${data}`); msg += `${data}` } }
async function SendMsg(message) { if (!message) return; if (Notify > 0) { if ($.isNode()) { var notify = require("./sendNotify"); await notify.sendNotify($.name, message) } else { $.msg($.name, '', message) } } else { console.log(message) } }
function MD5Encrypt(a) { function b(a, b) { return a << b | a >>> 32 - b } function c(a, b) { var c, d, e, f, g; return e = 2147483648 & a, f = 2147483648 & b, c = 1073741824 & a, d = 1073741824 & b, g = (1073741823 & a) + (1073741823 & b), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f } function d(a, b, c) { return a & b | ~a & c } function e(a, b, c) { return a & c | b & ~c } function f(a, b, c) { return a ^ b ^ c } function g(a, b, c) { return b ^ (a | ~c) } function h(a, e, f, g, h, i, j) { return a = c(a, c(c(d(e, f, g), h), j)), c(b(a, i), e) } function i(a, d, f, g, h, i, j) { return a = c(a, c(c(e(d, f, g), h), j)), c(b(a, i), d) } function j(a, d, e, g, h, i, j) { return a = c(a, c(c(f(d, e, g), h), j)), c(b(a, i), d) } function k(a, d, e, f, h, i, j) { return a = c(a, c(c(g(d, e, f), h), j)), c(b(a, i), d) } function l(a) { for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;)b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | a.charCodeAt(i) << h, i++; return b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | 128 << h, g[f - 2] = c << 3, g[f - 1] = c >>> 29, g } function m(a) { var b, c, d = "", e = ""; for (c = 0; 3 >= c; c++)b = a >>> 8 * c & 255, e = "0" + b.toString(16), d += e.substr(e.length - 2, 2); return d } function n(a) { a = a.replace(/\r\n/g, "\n"); for (var b = "", c = 0; c < a.length; c++) { var d = a.charCodeAt(c); 128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128)) } return b } var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21; for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16)p = t, q = u, r = v, s = w, t = h(t, u, v, w, x[o + 0], y, 3614090360), w = h(w, t, u, v, x[o + 1], z, 3905402710), v = h(v, w, t, u, x[o + 2], A, 606105819), u = h(u, v, w, t, x[o + 3], B, 3250441966), t = h(t, u, v, w, x[o + 4], y, 4118548399), w = h(w, t, u, v, x[o + 5], z, 1200080426), v = h(v, w, t, u, x[o + 6], A, 2821735955), u = h(u, v, w, t, x[o + 7], B, 4249261313), t = h(t, u, v, w, x[o + 8], y, 1770035416), w = h(w, t, u, v, x[o + 9], z, 2336552879), v = h(v, w, t, u, x[o + 10], A, 4294925233), u = h(u, v, w, t, x[o + 11], B, 2304563134), t = h(t, u, v, w, x[o + 12], y, 1804603682), w = h(w, t, u, v, x[o + 13], z, 4254626195), v = h(v, w, t, u, x[o + 14], A, 2792965006), u = h(u, v, w, t, x[o + 15], B, 1236535329), t = i(t, u, v, w, x[o + 1], C, 4129170786), w = i(w, t, u, v, x[o + 6], D, 3225465664), v = i(v, w, t, u, x[o + 11], E, 643717713), u = i(u, v, w, t, x[o + 0], F, 3921069994), t = i(t, u, v, w, x[o + 5], C, 3593408605), w = i(w, t, u, v, x[o + 10], D, 38016083), v = i(v, w, t, u, x[o + 15], E, 3634488961), u = i(u, v, w, t, x[o + 4], F, 3889429448), t = i(t, u, v, w, x[o + 9], C, 568446438), w = i(w, t, u, v, x[o + 14], D, 3275163606), v = i(v, w, t, u, x[o + 3], E, 4107603335), u = i(u, v, w, t, x[o + 8], F, 1163531501), t = i(t, u, v, w, x[o + 13], C, 2850285829), w = i(w, t, u, v, x[o + 2], D, 4243563512), v = i(v, w, t, u, x[o + 7], E, 1735328473), u = i(u, v, w, t, x[o + 12], F, 2368359562), t = j(t, u, v, w, x[o + 5], G, 4294588738), w = j(w, t, u, v, x[o + 8], H, 2272392833), v = j(v, w, t, u, x[o + 11], I, 1839030562), u = j(u, v, w, t, x[o + 14], J, 4259657740), t = j(t, u, v, w, x[o + 1], G, 2763975236), w = j(w, t, u, v, x[o + 4], H, 1272893353), v = j(v, w, t, u, x[o + 7], I, 4139469664), u = j(u, v, w, t, x[o + 10], J, 3200236656), t = j(t, u, v, w, x[o + 13], G, 681279174), w = j(w, t, u, v, x[o + 0], H, 3936430074), v = j(v, w, t, u, x[o + 3], I, 3572445317), u = j(u, v, w, t, x[o + 6], J, 76029189), t = j(t, u, v, w, x[o + 9], G, 3654602809), w = j(w, t, u, v, x[o + 12], H, 3873151461), v = j(v, w, t, u, x[o + 15], I, 530742520), u = j(u, v, w, t, x[o + 2], J, 3299628645), t = k(t, u, v, w, x[o + 0], K, 4096336452), w = k(w, t, u, v, x[o + 7], L, 1126891415), v = k(v, w, t, u, x[o + 14], M, 2878612391), u = k(u, v, w, t, x[o + 5], N, 4237533241), t = k(t, u, v, w, x[o + 12], K, 1700485571), w = k(w, t, u, v, x[o + 3], L, 2399980690), v = k(v, w, t, u, x[o + 10], M, 4293915773), u = k(u, v, w, t, x[o + 1], N, 2240044497), t = k(t, u, v, w, x[o + 8], K, 1873313359), w = k(w, t, u, v, x[o + 15], L, 4264355552), v = k(v, w, t, u, x[o + 6], M, 2734768916), u = k(u, v, w, t, x[o + 13], N, 1309151649), t = k(t, u, v, w, x[o + 4], K, 4149444226), w = k(w, t, u, v, x[o + 11], L, 3174756917), v = k(v, w, t, u, x[o + 2], M, 718787259), u = k(u, v, w, t, x[o + 9], N, 3951481745), t = c(t, p), u = c(u, q), v = c(v, r), w = c(w, s); var O = m(t) + m(u) + m(v) + m(w); return O.toLowerCase() }
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
