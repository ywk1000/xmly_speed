/*
cron "12 10,22 * * *" jd_bean_change.js, tag:资产变化强化版by-ccwav
 */

//详细说明参考 https://github.com/ccwav/QLScript2

const $ = new Env('京东资产变动');
const notify = $.isNode() ? require('./sendNotify') : '';
const JXUserAgent = $.isNode() ? (process.env.JX_USER_AGENT ? process.env.JX_USER_AGENT : ``) : ``;
const axios = require('axios');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let NowHour = new Date().getHours();

//默认开启缓存模式
let checkbeanDetailMode=1;
if ($.isNode() && process.env.BEANCHANGE_BEANDETAILMODE){
	checkbeanDetailMode=process.env.BEANCHANGE_BEANDETAILMODE*1;
}

const fs = require('fs');
let matchtitle="昨日";
let yesterday="";
let TodayDate="";
let startDate="";
let endDate="";
try {
    const moment = require("moment");
    昨天 = moment().subtract(1, 'days').format('YYYY-MM-DD');
    TodayDate = moment().format("YYYY-MM-DD");
    startDate = moment().startOf("month").format("YYYY_MM");
    endDate = moment().endOf("month").format("YYYY-MM-DD");
} catch (e) {
    console.log("依赖缺失，请先安装依赖moment!");
    return
}

if (!fs.existsSync("./BeanCache")) {
    fs.mkdirSync("./BeanCache");
}

let strBeanCache = "./BeanCache/" + yesterday + ".json";
let strNewBeanCache = "./BeanCache/" + TodayDate + ".json";
let TodayCache = [];
let Fileexists = fs.existsSync(strBeanCache);
let TempBeanCache = [];
if(!Fileexists){
	yesterday=TodayDate;
	strBeanCache=strNewBeanCache;
	Fileexists = fs.existsSync(strBeanCache);
	matchtitle="今日";
}
if (Fileexists) {
    console.log("检测到资产变动缓存文件"+yesterday+".json，载入...");
    TempBeanCache = fs.readFileSync(strBeanCache, 'utf-8');
    if (TempBeanCache) {
        TempBeanCache = TempBeanCache.toString();
        TempBeanCache = JSON.parse(TempBeanCache);
    }
}

Fileexists = fs.existsSync(strNewBeanCache);
if (Fileexists) {
    console.log("检测到资产变动缓存文件"+TodayDate+".json，载入...");
    TodayCache = fs.readFileSync(strNewBeanCache, 'utf-8');
    if (TodayCache) {
        TodayCache = TodayCache.toString();
        TodayCache = JSON.parse(TodayCache);
    }
}


let allMessage = '';
let allMessage2 = '';
let allReceiveMessage = '';
let allWarnMessage = '';
let ReturnMessage = '';
let ReturnMessageMonth = '';
let allMessageMonth = '';

let MessageUserGp2 = '';
let ReceiveMessageGp2 = '';
let WarnMessageGp2 = '';
let allMessageGp2 = '';
let allMessage2Gp2 = '';
let allMessageMonthGp2 = '';
let IndexGp2 = 0;

let MessageUserGp3 = '';
let ReceiveMessageGp3 = '';
let WarnMessageGp3 = '';
let allMessageGp3 = '';
let allMessage2Gp3 = '';
let allMessageMonthGp3 = '';
let IndexGp3 = 0;

let MessageUserGp4 = '';
let ReceiveMessageGp4 = '';
let WarnMessageGp4 = '';
let allMessageGp4 = '';
let allMessageMonthGp4 = '';
let allMessage2Gp4 = '';
let IndexGp4 = 0;

let MessageUserGp5 = '';
let ReceiveMessageGp5 = '';
let WarnMessageGp5 = '';
let allMessageGp5 = '';
let allMessageMonthGp5 = '';
let allMessage2Gp5 = '';
let IndexGp5 = 0;

let MessageUserGp6 = '';
let ReceiveMessageGp6 = '';
let WarnMessageGp6 = '';
let allMessageGp6 = '';
let allMessageMonthGp6 = '';
let allMessage2Gp6 = '';
let IndexGp6 = 0;

let MessageUserGp7 = '';
let ReceiveMessageGp7 = '';
let WarnMessageGp7 = '';
let allMessageGp7 = '';
let allMessageMonthGp7 = '';
let allMessage2Gp7 = '';
let IndexGp7 = 0;

let MessageUserGp8 = '';
let ReceiveMessageGp8 = '';
let WarnMessageGp8 = '';
let allMessageGp8 = '';
let allMessageMonthGp8 = '';
let allMessage2Gp8 = '';
let IndexGp8 = 0;

let notifySkipList = "";
let IndexAll = 0;
let EnableMonth = "false";
let isSignError = false;
let ReturnMessageTitle="";
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let intPerSent = 0;
let i = 0;
let llShowMonth = false;
let Today = new Date();
let strAllNotify="";
let strSubNotify="";
let llPetError=false;
let strGuoqi="";
let RemainMessage = '\n';
RemainMessage += "⭕活动攻略:⭕" + '\n';
RemainMessage += '【礼品卡】京东->我的->礼品卡,仅自营商品和一号店app可用\n';
RemainMessage += '【超市卡】京东->我的->礼品卡->京东超市,仅京东超市商品可用\n';
RemainMessage += '【特价金币】京东特价版->我的->金币(特价版使用)\n';
RemainMessage += '【领现金】京东->搜索领现金(微信提现+京东红包)\n';
RemainMessage += '【东东农场】京东->我的->东东农场,完成是京东红包,可以用于京东app的任意商品\n';
RemainMessage += '【京东金融】京东金融app->我的->养猪猪,完成是白条支付券,支付方式选白条支付时立减.\n';
RemainMessage += '【其他】京喜红包只能在京喜使用,其他同理';

let WP_APP_TOKEN_ONE = "";

let TempBaipiao = "";
let llgeterror=false;
let time = new Date().getHours();
if ($.isNode()) {
	if (process.env.WP_APP_TOKEN_ONE) {		
		WP_APP_TOKEN_ONE = process.env.WP_APP_TOKEN_ONE;
	}
}
if(WP_APP_TOKEN_ONE)
	console.log(`检测到已配置Wxpusher的Token，启用一对一推送...`);
else
	console.log(`检测到未配置Wxpusher的Token，禁用一对一推送...`);

let jdSignUrl = 'http://10.8.38.3:60800/sign'
if (process.env.SIGNURL)
	jdSignUrl = process.env.SIGNURL;

let epsignurl=""
if (process.env.epsignurl)
    epsignurl = process.env.epsignurl;

if ($.isNode() && process.env.BEANCHANGE_PERSENT) {
	intPerSent = parseInt(process.env.BEANCHANGE_PERSENT);
	console.log(`检测到设定了分段通知:` + intPerSent);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP2) {
	MessageUserGp2 = process.env.BEANCHANGE_USERGP2 ? process.env.BEANCHANGE_USERGP2.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送2,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP3) {
	MessageUserGp3 = process.env.BEANCHANGE_USERGP3 ? process.env.BEANCHANGE_USERGP3.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送3,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP4) {
	MessageUserGp4 = process.env.BEANCHANGE_USERGP4 ? process.env.BEANCHANGE_USERGP4.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送4,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP5) {
	MessageUserGp5 = process.env.BEANCHANGE_USERGP5 ? process.env.BEANCHANGE_USERGP5.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送5,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP6) {
	MessageUserGp6 = process.env.BEANCHANGE_USERGP6 ? process.env.BEANCHANGE_USERGP6.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送6,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP7) {
	MessageUserGp7 = process.env.BEANCHANGE_USERGP7 ? process.env.BEANCHANGE_USERGP7.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送7,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP8) {
	MessageUserGp8 = process.env.BEANCHANGE_USERGP8 ? process.env.BEANCHANGE_USERGP8.split('&') : [];
	intPerSent = 0; //分组推送，禁用账户拆分
	console.log(`检测到设定了分组推送8,将禁用分段通知`);
}

//取消月结查询
//if ($.isNode() && process.env.BEANCHANGE_ENABLEMONTH) {
	//EnableMonth = process.env.BEANCHANGE_ENABLEMONTH;
//}

if ($.isNode() && process.env.BEANCHANGE_SUBNOTIFY) {	
	strSubNotify=process.env.BEANCHANGE_SUBNOTIFY;
	strSubNotify+="\n";
	console.log(`检测到预览置顶内容,将在一对一推送的预览显示...\n`);	
}

if ($.isNode() && process.env.BEANCHANGE_ALLNOTIFY) {	
	strAllNotify=process.env.BEANCHANGE_ALLNOTIFY;
	console.log(`检测到设定了公告,将在推送信息中置顶显示...`);
	strAllNotify = `【✨✨✨✨公告✨✨✨✨】\n`+strAllNotify;
	console.log(strAllNotify+"\n");
	strAllNotify +=`\n🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏`
}


if (EnableMonth == "true" && Today.getDate() == 1 && Today.getHours() > 17)
	llShowMonth = true;

let userIndex2 = -1;
let userIndex3 = -1;
let userIndex4 = -1;
let userIndex5 = -1;
let userIndex6 = -1;
let userIndex7 = -1;
let userIndex8 = -1;


if ($.isNode()) {
	Object.keys(jdCookieNode).forEach((item) => {
		cookiesArr.push(jdCookieNode[item])
	})
	if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false')
		console.log = () => {};
} else {
	cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

//查询开关
let strDisableList = "";
let DisableIndex=-1;
if ($.isNode()) {	
	strDisableList = process.env.BEANCHANGE_DISABLELIST ? process.env.BEANCHANGE_DISABLELIST.split('&') : [];
}

//东东农场
let EnableJdFruit=true;
DisableIndex = strDisableList.findIndex((item) => item === "东东农场");
if(DisableIndex!=-1){
	console.log("检测到设定关闭东东农场查询");
	EnableJdFruit=false;	
}

//特价金币
let EnableJdSpeed=true;
DisableIndex = strDisableList.findIndex((item) => item === "极速金币");
if(DisableIndex!=-1){
	console.log("检测到设定关闭特价金币查询");
	EnableJdSpeed=false;	
}

//领现金
let EnableCash=true;
DisableIndex=strDisableList.findIndex((item) => item === "领现金");
if(DisableIndex!=-1){
	console.log("检测到设定关闭领现金查询");
	EnableCash=false;	
}	

//7天过期京豆
let EnableOverBean=true;
DisableIndex=strDisableList.findIndex((item) => item === "过期京豆");
if(DisableIndex!=-1){
	console.log("检测到设定关闭过期京豆查询");
	EnableOverBean=false
}

DisableIndex=strDisableList.findIndex((item) => item === "活动攻略");
if(DisableIndex!=-1){
	console.log("检测到设定关闭活动攻略显示");
	RemainMessage="";
}


//京豆收益查询
let EnableCheckBean=true;
DisableIndex=strDisableList.findIndex((item) => item === "京豆收益");
if(DisableIndex!=-1){
	console.log("检测到设定关闭京豆收益查询");
	EnableCheckBean=false
}

let EnableCheckEcard=true;
DisableIndex=strDisableList.findIndex((item) => item === "E卡查询");
if(DisableIndex!=-1){
	console.log("检测到设定关闭E卡查询");
	EnableCheckEcard=false
}

!(async() => {
	if (!cookiesArr[0]) {
		$.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
			"open-url": "https://bean.m.jd.com/bean/signIndex.action"
		});
		return;
	}
	for (i = 0; i < cookiesArr.length; i++) {
		if (cookiesArr[i]) {
			cookie = cookiesArr[i];
			$.pt_pin = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
			$.index = i + 1;
			$.beanCount = 0;
			$.incomeBean = 0;
			$.expenseBean = 0;
			$.todayIncomeBean = 0;
			$.todayOutcomeBean = 0;
			$.errorMsg = '';
			$.isLogin = true;
			$.nickName = '';
			$.levelName = '';
			$.message = '';
			$.balance = 0;
			$.expiredBalance = 0;
			$.JdFarmProdName = '';
			$.JdtreeEnergy = 0;
			$.JdtreeTotalEnergy = 0;
			$.treeState = 0;
			$.JdwaterTotalT = 0;
			$.JdwaterD = 0;
			$.JDwaterEveryDayT = 0;
			$.JDtotalcash = 0;
			$.jdCash = 0;
			$.isPlusVip = false;
			$.isRealNameAuth = false;
			$.JingXiang = "";
			$.allincomeBean = 0; //月收入
			$.allexpenseBean = 0; //月支出
			$.beanChangeXi=0;
			$.YunFeiTitle="";
			$.YunFeiQuan = 0;
			$.YunFeiQuanEndTime = "";
			$.YunFeiTitle2="";
			$.YunFeiQuan2 = 0;
			$.YunFeiQuanEndTime2 = "";
			$.ECardinfo = "";
			$.PlustotalScore=0;
			$.CheckTime="";
			$.beanCache=0;
			$.marketCardTotal="";			
			TempBaipiao = "";
			strGuoqi="";
			
			console.log(`******开始查询【京东账号${$.index}】${$.nickName || $.UserName}*********`);
			await TotalBean();			
		    //await TotalBean2();			
			if ($.beanCount == 0) {
				console.log("疑似获取失败,用第二个接口试试....")
			    var userdata = await getuserinfo();
			    if (userdata.code == 1) {
			        $.beanCount = userdata.content.jdBean;
			    }
			}
			
			
			if (!$.isLogin) {
				await isLoginByX1a0He();
			}
			if (!$.isLogin) {
				$.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
					"open-url": "https://bean.m.jd.com/bean/signIndex.action"
				});

				if ($.isNode()) {
					await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
				}
				continue
			}
			
			if (TempBeanCache) {
			    for (let j = 0; j < TempBeanCache.length; j++) {
			        if (TempBeanCache[j].pt_pin == $.UserName) {
						$.CheckTime = TempBeanCache[j].CheckTime;
			            $.beanCache = TempBeanCache[j].BeanNum;
			            break;
			        }
			    }
			}
			
			var llfound = false;
			var timeString = "";
			var nowHour = new Date().getHours();
			var nowMinute = new Date().getMinutes();
			if (nowHour < 10)
			    timeString += "0" + nowHour + ":";
			else
			    timeString += nowHour + ":";

			if (nowMinute < 10)
			    timeString += "0" + nowMinute;
			else
			    timeString += nowMinute;

			if (TodayCache) {
			    for (let j = 0; j < TodayCache.length; j++) {
			        if (TodayCache[j].pt_pin == $.UserName) {
			            TodayCache[j].CheckTime = timeString;
			            TodayCache[j].BeanNum = $.beanCount;
			            llfound = true;
			            break;
			        }
			    }
			}
			if (!llfound) {

			    var tempAddCache = {
			        "pt_pin": $.UserName,
			        "CheckTime": timeString,
			        "BeanNum": $.beanCount
			    };
			    TodayCache.push(tempAddCache);
			}
						
			await getjdfruitinfo(); //东东农场
			await $.wait(1000);
			
			await Promise.all([
			        cash(), //特价金币
			        bean(), //京豆查询
			        jdCash(), //领现金
					CheckEcard(), //E卡查询
					getmarketCard()
			    ])
				
			await showMsg();
			if (intPerSent > 0) {
				if ((i + 1) % intPerSent == 0) {
					console.log("分段通知条件达成，处理发送通知....");
					if ($.isNode() && allMessage) {
						var TempMessage=allMessage;
						if(strAllNotify)
							allMessage=strAllNotify+`\n`+allMessage;

						await notify.sendNotify(`${$.name}`, `${allMessage}`, {
							url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
						}, '\n\n本通知 By ywk1000',TempMessage)
					}
					if ($.isNode() && allMessageMonth) {
						await notify.sendNotify(`京东月资产变动`, `${allMessageMonth}`, {
							url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
						})
					}
					allMessage = "";
					allMessageMonth = "";
				}

			}
		}
	}
	
	var str = JSON.stringify(TodayCache, null, 2);
	fs.writeFile(strNewBeanCache, str, function (err) {
	    if (err) {
	        console.log(err);
	        console.log("添加缓存" + TodayDate + ".json失败!");
	    } else {
	        console.log("添加缓存" + TodayDate + ".json成功!");
	    }
	})

	//组1通知
	if (ReceiveMessageGp8) {
		allMessage2Gp8 = `【⏰商品白嫖活动领取提醒⏰】\n` + ReceiveMessageGp8;
	}
	if (WarnMessageGp8) {
		if (allMessage2Gp8) {
			allMessage2Gp8 = `\n` + allMessage2Gp8;
		}
		allMessage2Gp8 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp8 + allMessage2Gp8;
	}

	//组2通知
	if (ReceiveMessageGp2) {
		allMessage2Gp2 = `【⏰商品白嫖活动领取提醒⏰】\n` + ReceiveMessageGp2;
	}
	if (WarnMessageGp2) {
		if (allMessage2Gp2) {
			allMessage2Gp2 = `\n` + allMessage2Gp2;
		}
		allMessage2Gp2 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp2 + allMessage2Gp2;
	}

	//组3通知
	if (ReceiveMessageGp3) {
		allMessage2Gp3 = `【⏰商品白嫖活动领取提醒⏰】\n` + ReceiveMessageGp3;
	}
	if (WarnMessageGp3) {
		if (allMessage2Gp3) {
			allMessage2Gp3 = `\n` + allMessage2Gp3;
		}
		allMessage2Gp3 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp3 + allMessage2Gp3;
	}
	
	//组4通知
	if (ReceiveMessageGp4) {
		allMessage2Gp4 = `【⏰商品白嫖活动领取提醒⏰】\n` + ReceiveMessageGp4;
	}
	if (WarnMessageGp4) {
		if (allMessage2Gp4) {
			allMessage2Gp4 = `\n` + allMessage2Gp4;
		}
		allMessage2Gp3 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp4 + allMessage2Gp4;
	}
	
	//组5通知
	if (ReceiveMessageGp5) {
		allMessage2Gp5 = `【⏰商品白嫖活动领取提醒⏰】\n` + ReceiveMessageGp5;
	}
	if (WarnMessageGp5) {
		if (allMessage2Gp5) {
			allMessage2Gp5 = `\n` + allMessage2Gp5;
		}
		allMessage2Gp5 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp5 + allMessage2Gp5;
	}
	
	//组6通知
	if (ReceiveMessageGp6) {
		allMessage2Gp6 = `【⏰商品白嫖活动领取提醒⏰】\n` + ReceiveMessageGp6;
	}
	if (WarnMessageGp6) {
		if (allMessage2Gp6) {
			allMessage2Gp6 = `\n` + allMessage2Gp6;
		}
		allMessage2Gp6 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp6 + allMessage2Gp6;
	}
	
	//组7通知
	if (ReceiveMessageGp7) {
		allMessage2Gp7 = `【⏰商品白嫖活动领取提醒⏰】\n` + ReceiveMessageGp7;
	}
	if (WarnMessageGp7) {
		if (allMessage2Gp7) {
			allMessage2Gp7 = `\n` + allMessage2Gp7;
		}
		allMessage2Gp7 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp7 + allMessage2Gp7;
	}


	//其他通知
	if (allReceiveMessage) {
		allMessage2 = `【⏰商品白嫖活动领取提醒⏰】\n` + allReceiveMessage;
	}
	if (allWarnMessage) {
		if (allMessage2) {
			allMessage2 = `\n` + allMessage2;
		}
		allMessage2 = `【⏰商品白嫖活动任务提醒⏰】\n` + allWarnMessage + allMessage2;
	}

	if (intPerSent > 0) {
		//console.log("分段通知还剩下" + cookiesArr.length % intPerSent + "个账号需要发送...");
		if (allMessage || allMessageMonth) {
			console.log("分段通知收尾，处理发送通知....");
			if ($.isNode() && allMessage) {
				var TempMessage=allMessage;
				if(strAllNotify)
					allMessage=strAllNotify+`\n`+allMessage;
				
				await notify.sendNotify(`${$.name}`, `${allMessage}`, {
					url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
				}, '\n\n本通知 By ywk1000 ',TempMessage)
			}
			if ($.isNode() && allMessageMonth) {
				await notify.sendNotify(`京东月资产变动`, `${allMessageMonth}`, {
					url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
				})
			}
		}
	} else {

		if ($.isNode() && allMessageGp2) {
			var TempMessage=allMessageGp2;
			if(strAllNotify)
				allMessageGp2=strAllNotify+`\n`+allMessageGp2;
			await notify.sendNotify(`${$.name}#2`, `${allMessageGp2}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, '\n\n本通知 By ywk1000 ',TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp3) {
			var TempMessage=allMessageGp3;
			if(strAllNotify)
				allMessageGp3=strAllNotify+`\n`+allMessageGp3;
			await notify.sendNotify(`${$.name}#3`, `${allMessageGp3}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, '\n\n本通知 By ywk1000 ',TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp4) {
			var TempMessage=allMessageGp4;
			if(strAllNotify)
				allMessageGp4=strAllNotify+`\n`+allMessageGp4;
			await notify.sendNotify(`${$.name}#4`, `${allMessageGp4}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, '\n\n本通知 By ywk1000',TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp5) {
			var TempMessage=allMessageGp5;
			if(strAllNotify)
				allMessageGp5=strAllNotify+`\n`+allMessageGp5;
			await notify.sendNotify(`${$.name}#5`, `${allMessageGp5}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, '\n\n本通知 By ywk1000',TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp6) {
			var TempMessage=allMessageGp6;
			if(strAllNotify)
				allMessageGp6=strAllNotify+`\n`+allMessageGp6;
			await notify.sendNotify(`${$.name}#6`, `${allMessageGp6}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, '\n\n本通知 By ywk1000',TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp7) {
			var TempMessage=allMessageGp7;
			if(strAllNotify)
				allMessageGp7=strAllNotify+`\n`+allMessageGp7;
			await notify.sendNotify(`${$.name}#7`, `${allMessageGp7}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, '\n\n本通知 By ywk1000',TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageGp8) {
			var TempMessage=allMessageGp8;
			if(strAllNotify)
				allMessageGp8=strAllNotify+`\n`+allMessageGp8;
			await notify.sendNotify(`${$.name}#8`, `${allMessageGp8}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, '\n\n本通知 By ywk1000',TempMessage)
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessage) {
			var TempMessage=allMessage;
			if(strAllNotify)
				allMessage=strAllNotify+`\n`+allMessage;
			
			await notify.sendNotify(`${$.name}`, `${allMessage}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			}, '\n\n本通知 By ywk1000 ',TempMessage)
			await $.wait(10 * 1000);
		}

		if ($.isNode() && allMessageMonthGp2) {
			await notify.sendNotify(`京东月资产变动#2`, `${allMessageMonthGp2}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp3) {
			await notify.sendNotify(`京东月资产变动#3`, `${allMessageMonthGp3}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp4) {
			await notify.sendNotify(`京东月资产变动#4`, `${allMessageMonthGp4}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp5) {
			await notify.sendNotify(`京东月资产变动#5`, `${allMessageMonthGp5}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp6) {
			await notify.sendNotify(`京东月资产变动#6`, `${allMessageMonthGp6}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp7) {
			await notify.sendNotify(`京东月资产变动#7`, `${allMessageMonthGp7}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonthGp8) {
			await notify.sendNotify(`京东月资产变动#8`, `${allMessageMonthGp8}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
		if ($.isNode() && allMessageMonth) {
			await notify.sendNotify(`京东月资产变动`, `${allMessageMonth}`, {
				url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
			})
			await $.wait(10 * 1000);
		}
	}

	if ($.isNode() && allMessage2Gp2) {
		allMessage2Gp2 += RemainMessage;
		await notify.sendNotify("京东白嫖榜#2", `${allMessage2Gp2}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp3) {
		allMessage2Gp3 += RemainMessage;
		await notify.sendNotify("京东白嫖榜#3", `${allMessage2Gp3}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp4) {
		allMessage2Gp4 += RemainMessage;
		await notify.sendNotify("京东白嫖榜#4", `${allMessage2Gp4}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp5) {
		allMessage2Gp5 += RemainMessage;
		await notify.sendNotify("京东白嫖榜#5", `${allMessage2Gp5}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp6) {
		allMessage2Gp6 += RemainMessage;
		await notify.sendNotify("京东白嫖榜#6", `${allMessage2Gp6}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp7) {
		allMessage2Gp7 += RemainMessage;
		await notify.sendNotify("京东白嫖榜#7", `${allMessage2Gp7}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2Gp8) {
		allMessage2Gp8 += RemainMessage;
		await notify.sendNotify("京东白嫖榜#8", `${allMessage2Gp8}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}
	if ($.isNode() && allMessage2) {
		allMessage2 += RemainMessage;
		await notify.sendNotify("京东白嫖榜", `${allMessage2}`, {
			url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
		})
		await $.wait(10 * 1000);
	}

})()
.catch((e) => {
	$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
})
.finally(() => {
	$.done();
})
async function showMsg() {
	//if ($.errorMsg)
	//return
	ReturnMessageTitle="";
	ReturnMessage = "";
	var strsummary="";
	if (MessageUserGp2) {
		userIndex2 = MessageUserGp2.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp3) {
		userIndex3 = MessageUserGp3.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp4) {
		userIndex4 = MessageUserGp4.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp5) {
		userIndex5 = MessageUserGp5.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp6) {
		userIndex6 = MessageUserGp6.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp7) {
		userIndex7 = MessageUserGp7.findIndex((item) => item === $.pt_pin);
	}
	if (MessageUserGp8) {
		userIndex8 = MessageUserGp8.findIndex((item) => item === $.pt_pin);
	}
	
	if (userIndex2 != -1) {
		IndexGp2 += 1;
		ReturnMessageTitle = `【账号${IndexGp2}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex3 != -1) {
		IndexGp3 += 1;
		ReturnMessageTitle = `【账号${IndexGp3}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex4 != -1) {
		IndexGp4 += 1;
		ReturnMessageTitle = `【账号${IndexGp4}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex5 != -1) {
		IndexGp5 += 1;
		ReturnMessageTitle = `【账号${IndexGp5}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex6 != -1) {
		IndexGp6 += 1;
		ReturnMessageTitle = `【账号${IndexGp6}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex7 != -1) {
		IndexGp7 += 1;
		ReturnMessageTitle = `【账号${IndexGp7}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex8 != -1) {
		IndexGp8 += 1;
		ReturnMessageTitle = `【账号${IndexGp8}🆔】${$.nickName || $.UserName}`;
	}
	if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1 && userIndex5 == -1 && userIndex6 == -1 && userIndex7 == -1 && userIndex8 == -1) {
		IndexAll += 1;
		ReturnMessageTitle = `【账号${IndexAll}🆔】${$.nickName || $.UserName}`;
	}
	
		
	if ($.JingXiang) {
		if ($.isRealNameAuth)
			if (cookie.includes("app_open"))
				ReturnMessageTitle += `(wskey已实名)\n`;
			else
				ReturnMessageTitle += `(已实名)\n`;
		else
			if (cookie.includes("app_open"))
				ReturnMessageTitle += `(wskey未实名)\n`;
			else
				ReturnMessageTitle += `(未实名)\n`;
			
	    ReturnMessage += `【账号信息】`;
	    if ($.isPlusVip) {
	        ReturnMessage += `Plus会员`;	        
	    } else {
	        ReturnMessage += `普通会员`;
	    } 
		if ($.PlustotalScore)
	        ReturnMessage += `(${$.PlustotalScore}分)` 
			
	    ReturnMessage += `,京享值${$.JingXiang}\n`;	    
	}else{
		ReturnMessageTitle+= `\n`;
	}
	if (llShowMonth) {
		ReturnMessageMonth = ReturnMessage;
		ReturnMessageMonth += `\n【上月收入】：${$.allincomeBean}京豆 🐶\n`;
		ReturnMessageMonth += `【上月支出】：${$.allexpenseBean}京豆 🐶\n`;

		console.log(ReturnMessageMonth);

		if (userIndex2 != -1) {
			allMessageMonthGp2 += ReturnMessageMonth + `\n`;
		}
		if (userIndex3 != -1) {
			allMessageMonthGp3 += ReturnMessageMonth + `\n`;
		}
		if (userIndex4 != -1) {
			allMessageMonthGp4 += ReturnMessageMonth + `\n`;
		}
		if (userIndex5 != -1) {
			allMessageMonthGp5 += ReturnMessageMonth + `\n`;
		}
		if (userIndex6 != -1) {
			allMessageMonthGp6 += ReturnMessageMonth + `\n`;
		}
		if (userIndex7 != -1) {
			allMessageMonthGp7 += ReturnMessageMonth + `\n`;
		}
		if (userIndex8 != -1) {
			allMessageMonthGp8 += ReturnMessageMonth + `\n`;
		}
		if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1 && userIndex5 == -1 && userIndex6 == -1 && userIndex7 == -1 && userIndex8 == -1) {
			allMessageMonth += ReturnMessageMonth + `\n`;
		}
		if ($.isNode() && WP_APP_TOKEN_ONE) {
			await notify.sendNotifybyWxPucher("京东月资产变动", `${ReturnMessageMonth}`, `${$.UserName}`);
		}

	}
	if (EnableCheckBean) {
	    if (checkbeanDetailMode == 0) {
	        ReturnMessage += `【今日京豆】收${$.todayIncomeBean}豆`;
	        strsummary += `收${$.todayIncomeBean}豆,`;
	        if ($.todayOutcomeBean != 0) {
	            ReturnMessage += `,支${$.todayOutcomeBean}豆`;
	        }
	        ReturnMessage += `\n`;
	        ReturnMessage += `【昨日京豆】收${$.incomeBean}豆`;

	        if ($.expenseBean != 0) {
	            ReturnMessage += `,支${$.expenseBean}豆`;
	        }
	        ReturnMessage += `\n`;
	    } else {	
			if (TempBeanCache){
				ReturnMessage += `【京豆变动】${$.beanCount-$.beanCache}豆(与${matchtitle}${$.CheckTime}比较)`;			
				strsummary += `变动${$.beanCount-$.beanCache}豆,`;
				ReturnMessage += `\n`;				
			}	
			else{
				ReturnMessage += `【京豆变动】未找到缓存,下次出结果统计`;
				ReturnMessage += `\n`;
			}		
		}
	}
	
	
	if ($.beanCount){		
		ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
	} else {
		if($.levelName || $.JingXiang)
			ReturnMessage += `【当前京豆】获取失败,接口返回空数据\n`;
		else{
			ReturnMessage += `【当前京豆】${$.beanCount-$.beanChangeXi}豆(≈${(($.beanCount-$.beanChangeXi)/ 100).toFixed(2)}元)\n`;
		}			
	}	
	
	if ($.JDtotalcash) {
		ReturnMessage += `【特价金币】${$.JDtotalcash}币(≈${($.JDtotalcash / 10000).toFixed(2)}元)\n`;
	}
	if($.ECardinfo)
		ReturnMessage += `【礼品卡余额】${$.ECardinfo}\n`;

	if($.marketCardTotal)
		ReturnMessage += `【超市卡余额】${$.marketCardTotal}\n`;	
	

	if ($.JdFarmProdName != "") {
		if ($.JdtreeEnergy != 0) {
			if ($.treeState === 2 || $.treeState === 3) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				TempBaipiao += `【东东农场】${$.JdFarmProdName} 可以兑换了!\n`;
				if (userIndex2 != -1) {
					ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex5 != -1) {
					ReceiveMessageGp5 += `【账号${IndexGp5} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex6 != -1) {
					ReceiveMessageGp6 += `【账号${IndexGp6} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex7 != -1) {
					ReceiveMessageGp7 += `【账号${IndexGp7} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex8 != -1) {
					ReceiveMessageGp8 += `【账号${IndexGp8} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1 && userIndex5 == -1 && userIndex6 == -1 && userIndex7 == -1 && userIndex8 == -1) {
					allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.JdFarmProdName} (东东农场)\n`;
				}
			} else {
				if ($.JdwaterD != 'Infinity' && $.JdwaterD != '-Infinity') {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%,${$.JdwaterD}天)\n`;
				} else {
					ReturnMessage += `【东东农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%)\n`;

				}
			}
		} else {
			if ($.treeState === 0) {
				TempBaipiao += `【东东农场】水果领取后未重新种植!\n`;

				if (userIndex2 != -1) {
					WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex5 != -1) {
					WarnMessageGp5 += `【账号${IndexGp5} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex6 != -1) {
					WarnMessageGp6 += `【账号${IndexGp6} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex7 != -1) {
					WarnMessageGp7 += `【账号${IndexGp7} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex8 != -1) {
					WarnMessageGp8 += `【账号${IndexGp8} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1 && userIndex5 == -1 && userIndex6 == -1 && userIndex7 == -1 && userIndex8 == -1) {
					allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】水果领取后未重新种植! (东东农场)\n`;
				}

			} else if ($.treeState === 1) {
				ReturnMessage += `【东东农场】${$.JdFarmProdName}种植中...\n`;
			} else {
				TempBaipiao += `【东东农场】状态异常!\n`;
				if (userIndex2 != -1) {
					WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex3 != -1) {
					WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex4 != -1) {
					WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex5 != -1) {
					WarnMessageGp5 += `【账号${IndexGp5} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex6 != -1) {
					WarnMessageGp6 += `【账号${IndexGp6} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex7 != -1) {
					WarnMessageGp7 += `【账号${IndexGp7} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex8 != -1) {
					WarnMessageGp8 += `【账号${IndexGp8} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1 && userIndex5 == -1 && userIndex6 == -1 && userIndex7 == -1 && userIndex8 == -1) {
					allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】状态异常! (东东农场)\n`;
				}
				//ReturnMessage += `【东东农场】${$.JdFarmProdName}状态异常${$.treeState}...\n`;
			}
		}
	}

	if ($.jdCash) {
		ReturnMessage += `【其他信息】`;

		if ($.jdCash) {
			ReturnMessage += `领现金:${$.jdCash}元`;
		}
		
		ReturnMessage += `\n`;

	}
	
	if(strGuoqi){		
		ReturnMessage += `💸💸💸临期京豆明细💸💸💸\n`;
		ReturnMessage += `${strGuoqi}`;
	}
	ReturnMessage += `🧧🧧🧧红包明细🧧🧧🧧\n`;
	ReturnMessage += `${$.message}`;
	strsummary+=`红包${$.balance}元`
	if($.YunFeiQuan){
		var strTempYF="【免运费券】"+$.YunFeiQuan+"张";
		if($.YunFeiQuanEndTime)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime+")";
		strTempYF+="\n";
		ReturnMessage +=strTempYF
	}
	if($.YunFeiQuan2){
		var strTempYF2="【免运费券】"+$.YunFeiQuan2+"张";
		if($.YunFeiQuanEndTime2)
			strTempYF+="(有效期至"+$.YunFeiQuanEndTime2+")";
		strTempYF2+="\n";
		ReturnMessage +=strTempYF2
	}
	
	if (userIndex2 != -1) {
		allMessageGp2 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex3 != -1) {
		allMessageGp3 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex4 != -1) {
		allMessageGp4 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex5 != -1) {
		allMessageGp5 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex6 != -1) {
		allMessageGp6 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex7 != -1) {
		allMessageGp7 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex8 != -1) {
		allMessageGp8 += ReturnMessageTitle+ReturnMessage + `\n`;
	}
	if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1 && userIndex5 == -1 && userIndex6 == -1 && userIndex7 == -1 && userIndex8 == -1) {
		allMessage += ReturnMessageTitle+ReturnMessage + `\n`;
	}

	console.log(`${ReturnMessageTitle+ReturnMessage}`);

	if ($.isNode() && WP_APP_TOKEN_ONE) {
		var strTitle="京东资产变动";
		if($.JingXiang){
			if ($.isRealNameAuth)
				if (cookie.includes("app_open"))
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(wskey已实名)\n`+ReturnMessage;
				else
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(已实名)\n`+ReturnMessage;
			else
				if (cookie.includes("app_open"))
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(wskey未实名)\n`+ReturnMessage;
				else
					ReturnMessage=`【账号名称】${$.nickName || $.UserName}(未实名)\n`+ReturnMessage;
			
		}else{
			ReturnMessage=`【账号名称】${$.nickName || $.UserName}\n`+ReturnMessage;
		}
		if (TempBaipiao) {
			TempBaipiao = `【⏰商品白嫖活动提醒⏰】\n` + TempBaipiao;
			ReturnMessage = TempBaipiao + `\n` + ReturnMessage;			
		}
		
		ReturnMessage += RemainMessage;
		
		if(strAllNotify)
			ReturnMessage=strAllNotify+`\n`+ReturnMessage;
		
		await notify.sendNotifybyWxPucher(strTitle, `${ReturnMessage}`, `${$.UserName}`,'\n\n本通知 By ccwav Mod',strsummary);
	}

	//$.msg($.name, '', ReturnMessage , {"open-url": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean"});
}
async function bean() {
	
	if (EnableCheckBean && checkbeanDetailMode==0) {	
			
	    // console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
	    // console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
	    // 不管哪个时区。得到都是当前时刻北京时间的时间戳 new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000

	    //前一天的0:0:0时间戳
	    const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
	    // 今天0:0:0时间戳
	    const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
	    let page = 1,
	    t = 0,
	    yesterdayArr = [],
	    todayArr = [];
	    do {
	        let response = await getJingBeanBalanceDetail(page);
	        await $.wait(1000);
	        // console.log(`第${page}页: ${JSON.stringify(response)}`);
	        if (response && response.code === "0") {
	            page++;
	            let detailList = response.jingDetailList;
	            if (detailList && detailList.length > 0) {
	                for (let item of detailList) {
	                    const date = item.date.replace(/-/g, '/') + "+08:00";
	                    if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
	                        todayArr.push(item);
	                    } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
	                        //昨日的
	                        yesterdayArr.push(item);
	                    } else if (tm > new Date(date).getTime()) {
	                        //前天的
	                        t = 1;
	                        break;
	                    }
	                }
	            } else {
	                $.errorMsg = `数据异常`;
	                $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
	                t = 1;
	            }
	        } else if (response && response.code === "3") {
	            console.log(`cookie已过期，或者填写不规范，跳出`)
	            t = 1;
	        } else {
	            console.log(`未知情况：${JSON.stringify(response)}`);
	            console.log(`未知情况，跳出`)
	            t = 1;
	        }
	    } while (t === 0);
	    for (let item of yesterdayArr) {
	        if (Number(item.amount) > 0) {
	            $.incomeBean += Number(item.amount);
	        } else if (Number(item.amount) < 0) {
	            $.expenseBean += Number(item.amount);
	        }
	    }
	    for (let item of todayArr) {
	        if (Number(item.amount) > 0) {
	            $.todayIncomeBean += Number(item.amount);
	        } else if (Number(item.amount) < 0) {
	            $.todayOutcomeBean += Number(item.amount);
	        }
	    }
	    $.todayOutcomeBean = -$.todayOutcomeBean;
	    $.expenseBean = -$.expenseBean;	    
	}
	
	if (EnableOverBean) {
	    await jingBeanDetail(); //过期京豆	    
	}
	await redPacket();	
}

async function Monthbean() {
	let time = new Date();
	let year = time.getFullYear();
	let month = parseInt(time.getMonth()); //取上个月
	if (month == 0) {
		//一月份，取去年12月，所以月份=12，年份减1
		month = 12;
		year -= 1;
	}

	//开始时间 时间戳
	let start = new Date(year + "-" + month + "-01 00:00:00").getTime();
	console.log(`计算月京豆起始日期:` + GetDateTime(new Date(year + "-" + month + "-01 00:00:00")));

	//结束时间 时间戳
	if (month == 12) {
		//取去年12月，进1个月，所以月份=1，年份加1
		month = 1;
		year += 1;
	}
	let end = new Date(year + "-" + (month + 1) + "-01 00:00:00").getTime();
	console.log(`计算月京豆结束日期:` + GetDateTime(new Date(year + "-" + (month + 1) + "-01 00:00:00")));

	let allpage = 1,
	allt = 0,
	allyesterdayArr = [];
	do {
		let response = await getJingBeanBalanceDetail(allpage);
		await $.wait(1000);
		// console.log(`第${allpage}页: ${JSON.stringify(response)}`);
		if (response && response.code === "0") {
			allpage++;
			let detailList = response.jingDetailList;
			if (detailList && detailList.length > 0) {
				for (let item of detailList) {
					const date = item.date.replace(/-/g, '/') + "+08:00";
					if (start <= new Date(date).getTime() && new Date(date).getTime() < end) {
						//日期区间内的京豆记录
						allyesterdayArr.push(item);
					} else if (start > new Date(date).getTime()) {
						//前天的
						allt = 1;
						break;
					}
				}
			} else {
				$.errorMsg = `数据异常`;
				$.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
				allt = 1;
			}
		} else if (response && response.code === "3") {
			console.log(`cookie已过期，或者填写不规范，跳出`)
			allt = 1;
		} else {
			console.log(`未知情况：${JSON.stringify(response)}`);
			console.log(`未知情况，跳出`)
			allt = 1;
		}
	} while (allt === 0);

	for (let item of allyesterdayArr) {
		if (Number(item.amount) > 0) {
			$.allincomeBean += Number(item.amount);
		} else if (Number(item.amount) < 0) {
			$.allexpenseBean += Number(item.amount);
		}
	}

}

async function jdCash() {
	if (!EnableCash)
		return;
	let functionId = "cash_homePage";
	let sign = await getSignfromNolan(functionId, {});
		return new Promise((resolve) => {
			$.post(apptaskUrl(functionId, sign), async (err, resp, data) => {
				try {
					if (err) {
						console.log(`${JSON.stringify(err)}`)
						console.log(`jdCash API请求失败，请检查网路重试`)
					} else {
						if (safeGet(data)) {
							data = JSON.parse(data);
							if (data.code === 0 && data.data.result) {
								$.jdCash = data.data.result.totalMoney || 0;								
								return
							}
						}
					}
				} catch (e) {
					$.logErr(e, resp)
				}
				finally {
					resolve(data);
				}
			})
		})
}

function randomUserAgent() {
    const uuid = generateRandomString('abcdefghijklmnopqrstuvwxyz0123456789', 40);
    const addressid = generateRandomString('1234567898647', 10);
    const iosVer = selectRandomFromArray(["15.1.1", "14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1"]);
    const iosV = iosVer.replace(/\./g, '_');
    const clientVersion = selectRandomFromArray(["10.3.0", "10.2.7", "10.2.4"]);
    const iPhone = selectRandomFromArray(["8", "9", "10", "11", "12", "13"]);
    const ADID = `${generateRandomString('0987654321ABCDEF', 8)}-${generateRandomString('0987654321ABCDEF', 4)}-${generateRandomString('0987654321ABCDEF', 4)}-${generateRandomString('0987654321ABCDEF', 4)}-${generateRandomString('0987654321ABCDEF', 12)}`;
    const area = `${generateRandomString('0123456789', 2)}_${generateRandomString('0123456789', 4)}_${generateRandomString('0123456789', 5)}_${generateRandomString('0123456789', 4)}`;
    const lng = `119.31991256596${randomInt(100, 999)}`;
    const lat = `26.1187118976${randomInt(100, 999)}`;

    const UserAgent = `jdapp;iPhone;10.0.4;${iosVer};${uuid};network/wifi;ADID/${ADID};model/iPhone${iPhone},1;addressid/${addressid};appBuild/167707;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS ${iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/null;supportJDSHWK/1`;
    return UserAgent;
}

function generateRandomString(chars, length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function selectRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

async function CheckEcard(ck) {
	if (!EnableCheckEcard)
        return;
	const UA=randomUserAgent();
    const url = 'https://mygiftcard.jd.com/giftcard/queryGiftCardItem/app?source=JDAP';
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh-Hans;q=0.9",
        "content-length": "44",
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie,
        "origin": "https://mygiftcard.jd.com",
        "referer": "https://mygiftcard.jd.com/giftcardForM.html?source=JDAP&sid=9f55a224c8286baa2fe3a7545bbd411w&un_area=16_1303_48712_48758",
        "user-agent": UA
    };
    
    let balance = 0;
	let TotalCard = 0;
    try {
		var data = 'pageNo=1&queryType=1&cardType=-1&pageSize=20';
        var response = await axios.post(url, data, { headers: headers });
		if (response.data?.couponVOList) {
		    var couponVOList = response.data.couponVOList;
		    TotalCard += couponVOList.length;
		    for (let i = 0; i < couponVOList.length; i++) {
		        balance += couponVOList[i]['balance'];
		    }

		    if (TotalCard == 20) {
		        data = 'pageNo=2&queryType=1&cardType=-1&pageSize=20';
		        response = await axios.post(url, data, {
		            headers: headers
		        });
		        couponVOList = response.data.couponVOList;
		        TotalCard += couponVOList.length;
		        for (let i = 0; i < couponVOList.length; i++) {
		            balance += couponVOList[i]['balance'];
		        }
		    }

		    if (balance > 0)
		        $.ECardinfo = '共' + TotalCard + '张E卡,合计' + parseFloat(balance).toFixed(2) + '元';
		}
		
    } catch (e) {
        console.error(e);
    }
}
async function getmarketCard() {
	if (!EnableCheckEcard)
        return;
    const url = 'https://api.m.jd.com/atop_channel_marketCard_cardInfo';
	const UA=randomUserAgent();
    const headers = {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh-Hans;q=0.9",
        "content-length": "1250",
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie,
        "origin": "https://pro.m.jd.com",
        "referer": "https://pro.m.jd.com/mall/active/3KehY4eAj3D1iLzFB7p5pb68qXkT/index.html?stath=54&navh=44&topNavStyle=1&babelChannel=ttt9&hideAnchorBottomTab=1&hideBack=1&tttparams=ib0MwweyJnTGF0IjoiMjYuMTE5OTQ2IiwidW5fYXJlYSI6IjE2XzEzMDNfNDg3MTJfNDg3NTgiLCJkTGF0IjoiIiwicHJzdGF0ZSI6IjAiLCJhZGRyZXNzSWQiOiI5MjU4MDQyNTg3IiwibGF0IjoiMC4wMDAwMDAiLCJwb3NMYXQiOiIyNi4xMTk5NDYiLCJwb3NMbmciOiIxMTkuMzIwMzM5IiwiZ3BzX2FyZWEiOiIwXzBfMF8wIiwibG5nIjoiMC4wMDAwMDAiLCJ1ZW1wcyI6IjAtMC0yIiwiZ0xuZyI6IjExOS4zMjAzMzkiLCJtb2RlbCI6ImlQaG9uZTE1LDIiLCJkTG5nIjoiIn60%3D&forceCurrentView=1&showhead=no",
        "request-from": "native",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": UA,
        "x-referer-page": "https://pro.m.jd.com/mall/active/3KehY4eAj3D1iLzFB7p5pb68qXkT/index.html",
        "x-rp-client": "h5_1.0.0"
    };
	const data='appid=jd-super-market&t=1705212843271&functionId=atop_channel_marketCard_cardInfo&client=m&uuid=1201e4461b24640164a706c0a3444fd79de6577f&body=%7B%22babelChannel%22%3A%22ttt9%22%2C%22isJdApp%22%3A%221%22%2C%22isWx%22%3A%220%22%7D&h5st=20240114141403366%3Btnyqq56fhh69dd12%3B35fa0%3Btk02w847d1aac41lMXgyKzErM2w1k33PAhGy9ZX69M3Rvtgag743srkufMW1LE0zE5Crn405w3HPl20IgdET8DfgM32d%3B87c14a095a901f37feabf4d6616b8e149539de48e2fd715bedda5baea9729c41%3B4.3%3B1705212843366%3B5fb5b0eea0d604be5747ccee135178e687458f7f659003bdc2ca943d6e3006043ae4bf75ab450370c9d309909a15a988f37ccb53c9ced6e3017095a1065b75238ed637a529a266eb3370fc34ce5a9036017e96632bec64838fdb2f9b39c675cdc7d19ddc121504a7a32f7e1da54fc20c2f8ce6b879c255b77a506eb644aa4e532df91f2c44c6e7412b713f82847feb7e76668e7b0dd6e97685dfff3708e0fa5d4a08ca7a4eba27b71f0d5ecbc75cb17e6c4a6052b5b7b30d17005a24eb576981c7dd1b066a8ac01ffee3f77faa4cba708daf2be433c83204e302ac610d3eba913f78a2d39a82d2f74c9f05fee1768d97ffae5668989394f4412c7de5dd105e663aca420a85fa949e412ff869d0199814a265a0f13cad4ff8e0a4e6c3ccebbd22cb1f0398da3ef6eedb3b6941fdc55d7449823c957977e607ddbdf39a6e016f98&x-api-eid-token=jdd03NK6FVUZZ5D76SCVX2RZCJX3PGM7JVJNWMQ56NLLLQEEVURFKGHP537UFXMCBYWZUBFICVZMQJNXLODQMJOA6B3YOIAAAAAMNA2NP7SQAAAAAD5BK47RNLM7UAYX'
    try {
		const response = await axios.post(url, data, { headers });		
        if (response.data.success && response.data.data?.floorData?.items && response.data.data?.floorData?.items[0].marketCardVO.balance>0) {
            $.marketCardTotal = "总"+response.data.data?.floorData?.items[0].marketCardVO.balance+"元";
			if(response.data.data?.floorData?.items[0].marketCardVO.expirationGiftAmountDes)
				$.marketCardTotal +=","+response.data.data?.floorData?.items[0].marketCardVO.expirationGiftAmountDes;
        }
	} catch (e) {
		console.error(e);
	}
}


function apptaskUrl(functionId = "", body = "") {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}`,
    body,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': '',
      'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    timeout: 10000
  }
}

function TotalBean() {
	return new Promise(async resolve => {
		const options = {
			url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
			headers: {
				"Accept": "application/json, text/plain",
				"accept-encoding": "gzip, deflate, br",
				"content-type": "application/json;charset=UTF-8",
				Cookie: cookie,
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.42"
			},
			timeout: 10000
		}
		$.get(options, (err, resp, data) => {
			try {
				if (err) {
					$.logErr(err)
				} else {					
					if (data) {
						data = JSON.parse(data);

						if (data['retcode'] === "1001") {
							$.isLogin = false; //cookie过期
							return;
						}
						if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
							$.nickName = data.data.userInfo.baseInfo.nickname;
							$.levelName = data.data.userInfo.baseInfo.levelName;
							$.isPlusVip = data.data.userInfo.isPlusVip;

						}
						if (data['retcode'] === '0' && data.data && data.data['assetInfo']) {
							if ($.beanCount == 0)
								$.beanCount = data.data && data.data['assetInfo']['beanNum'];
						} else {
							$.errorMsg = `数据异常`;
						}
					} else {
						$.log('京东服务器返回空数据,将无法获取等级及VIP信息');
					}
				}
			} catch (e) {
				$.logErr(e)
			}
			finally {
				resolve();
			}
		})
	})
} 
function isLoginByX1a0He() {
	return new Promise((resolve) => {
		const options = {
			url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
			headers: {
				"Cookie": cookie,
				"referer": "https://h5.m.jd.com/",
				"User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
			},
			timeout: 10000
		}
		$.get(options, (err, resp, data) => {
			try {
				if (data) {
					data = JSON.parse(data);
					if (data.islogin === "1") {
						console.log(`使用X1a0He写的接口加强检测: Cookie有效\n`)
					} else if (data.islogin === "0") {
						$.isLogin = false;
						console.log(`使用X1a0He写的接口加强检测: Cookie无效\n`)
					} else {
						console.log(`使用X1a0He写的接口加强检测: 未知返回，不作变更...\n`)
						$.error = `${$.nickName} :` + `使用X1a0He写的接口加强检测: 未知返回...\n`
					}
				}
			} catch (e) {
				console.log(e);
			}
			finally {
				resolve();
			}
		});
	});
}

function getJingBeanBalanceDetail(page) {
  return new Promise(async resolve => {
    const options = {
      "url": `https://bean.m.jd.com/beanDetail/detail.json?page=${page}`,
      "body": `body=${escape(JSON.stringify({"pageSize": "20", "page": page.toString()}))}&appid=ld`,
      "headers": {
        'User-Agent': "Mozilla/5.0 (Linux; Android 12; SM-G9880) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Mobile Safari/537.36 EdgA/106.0.1370.47",       
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`getJingBeanBalanceDetail API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            // console.log(data)
          } else {
            // console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function jingBeanDetail() {
	return new Promise(async resolve => {
		setTimeout(async () => {
			var strsign = "";
			if (epsignurl) {
				strsign = await getepsign('jingBeanDetail', { "pageSize": "20", "page": "1" });
				strsign = strsign.body;
			}
			else
				strsign = await getSignfromNolan('jingBeanDetail', { "pageSize": "20", "page": "1" });

			const options = {
				"url": `https://api.m.jd.com/client.action?functionId=jingBeanDetail`,
				"body": strsign,
				"headers": {
					'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
					'Host': 'api.m.jd.com',
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cookie': cookie,
				}
			}
			$.post(options, (err, resp, data) => {
				try {
					if (err) {
						console.log(`${JSON.stringify(err)}`)
						console.log(`${$.name} jingBeanDetail API请求失败，请检查网路重试`)
					} else {
						if (data) {
							data = JSON.parse(data);
							if (data?.others?.jingBeanExpiringInfo?.detailList) {
								const { detailList = [] } = data?.others?.jingBeanExpiringInfo;
								detailList.map(item => {
									strGuoqi += `【${(item['eventMassage']).replace("即将过期京豆", "").replace("年", "-").replace("月", "-").replace("日", "")}】过期${item['amount']}豆\n`;
								})
							}
						} else {
							console.log(`jingBeanDetail 京东服务器返回空数据`)
						}
					}
				} catch (e) {
					if (epsignurl)
						$.logErr(e, resp)
					else
						console.log("因为没有指定带ep的Sign,获取过期豆子信息次数多了就会失败.")
				} finally {
					resolve(data);
				}
			})
		}, 0 * 1000);
	})
} 
  
function getepsign(n, o, t = "sign") {	
  let e = {
    url: epsignurl, 
    form: {
      functionId: n, body: $.toStr(o),
    }, headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };
  return new Promise(n => {
    $.post(e, async (o, t, e) => {
      try {
        o ? console.log(o) : e = JSON.parse(e)
        if (e.code === 200 && e.data) {
          n({body: e.data.convertUrlNew})
        }
      } catch (n) {
        $.logErr(n, t)
      } finally {
        n({body: e.convertUrlNew})
      }
    })
  })
}

function getSignfromNolan(functionId, body) {	
    var strsign = '';
	let data = {
      "fn":functionId,
      "body": body
    }
    return new Promise((resolve) => {
        let url = {
            url: jdSignUrl,
            body: JSON.stringify(data),
		    followRedirect: false,
		    headers: {
		        'Accept': '*/*',
		        "accept-encoding": "gzip, deflate, br",
		        'Content-Type': 'application/json'
		    },
		    timeout: 30000
        }
        $.post(url, async(err, resp, data) => {
            try {				
                data = JSON.parse(data);
                if (data && data.body) {                    
                    if (data.body)
                        strsign = data.body || '';
                    if (strsign != '')
                        resolve(strsign);
                    else
                        console.log("签名获取失败.");
                } else {
                    console.log("签名获取失败.");
                }				
            }catch (e) {
                $.logErr(e, resp);
            }finally {
				resolve(strsign);
			}
        })
    })
}


function redPacket() {
	return new Promise(async resolve => {
		const options = {
			"url": `https://api.m.jd.com/client.action?functionId=myhongbao_getUsableHongBaoList&body=%7B%22appId%22%3A%22appHongBao%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22platformId%22%3A%22appHongBao%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22platform%22%3A%221%22%2C%22orgType%22%3A%222%22%2C%22country%22%3A%22cn%22%2C%22childActivityId%22%3A%22-1%22%2C%22childActiveName%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22openId%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22eid%22%3A%22-1%22%2C%22fp%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22shshshfpb%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22activityType%22%3A%221%22%2C%22isRvc%22%3A%22-1%22%2C%22pageClickKey%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22organization%22%3A%22JD%22%7D&appid=JDReactMyRedEnvelope&client=apple&clientVersion=7.0.0`,
			"headers": {
				'Host': 'api.m.jd.com',
				'Accept': '*/*',
				'Connection': 'keep-alive',
				'Accept-Language': 'zh-cn',
				'Referer': 'https://h5.m.jd.com/',
				'Accept-Encoding': 'gzip, deflate, br',
				"Cookie": cookie,
				'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
			}
		}
		$.get(options, (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`redPacket API请求失败，请检查网路重试`)
				} else {
					if (data) {
						data = JSON.parse(data);
						$.jxRed = 0,
						$.jsRed = 0,
						$.jdRed = 0,
						$.jdhRed = 0,
						$.jdwxRed = 0,
						$.jdGeneralRed = 0,
						$.jxRedExpire = 0,
						$.jsRedExpire = 0,
						$.jdRedExpire = 0,
						$.jdhRedExpire = 0;
						$.jdwxRedExpire = 0,
						$.jdGeneralRedExpire = 0
						
						let t = new Date();
						t.setDate(t.getDate() + 1);
						t.setHours(0, 0, 0, 0);
						t = parseInt((t - 1) / 1000)*1000;
						
						for (let vo of data.hongBaoList || []) {
						    if (vo.orgLimitStr) {								
						        if (vo.orgLimitStr.includes("京喜") && !vo.orgLimitStr.includes("特价")) {
						            $.jxRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jxRedExpire += parseFloat(vo.balance)									
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("购物小程序")) {
						            $.jdwxRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdwxRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("京东商城")) {
						            $.jdRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr.includes("极速") || vo.orgLimitStr.includes("京东特价") || vo.orgLimitStr.includes("京喜特价")) {
						            $.jsRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jsRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        } else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
						            $.jdhRed += parseFloat(vo.balance)
						            if (vo['endTime'] === t) {
						                $.jdhRedExpire += parseFloat(vo.balance)
						            }
									continue;	
						        }
						    }
						    $.jdGeneralRed += parseFloat(vo.balance)
						    if (vo['endTime'] === t) {
						        $.jdGeneralRedExpire += parseFloat(vo.balance)
						    }
						}
						
						$.balance = ($.jxRed+$.jsRed+$.jdRed +$.jdhRed+$.jdwxRed+$.jdGeneralRed).toFixed(2);
						$.jxRed = $.jxRed.toFixed(2);
						$.jsRed = $.jsRed.toFixed(2);
						$.jdRed = $.jdRed.toFixed(2);						
						$.jdhRed = $.jdhRed.toFixed(2);
						$.jdwxRed = $.jdwxRed.toFixed(2);
						$.jdGeneralRed = $.jdGeneralRed.toFixed(2);
						$.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire+$.jdhRedExpire+$.jdwxRedExpire+$.jdGeneralRedExpire).toFixed(2);
						$.message += `【红包总额】${$.balance}(总过期${$.expiredBalance})元 \n`;
						if ($.jxRed > 0){
							if($.jxRedExpire>0)
								$.message += `【京喜红包】${$.jxRed}(将过期${$.jxRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【京喜红包】${$.jxRed}元 \n`;
						}
							
						if ($.jsRed > 0){
							if($.jsRedExpire>0)
								$.message += `【京喜特价】${$.jsRed}(将过期${$.jsRedExpire.toFixed(2)})元(原极速版) \n`;
							else
								$.message += `【京喜特价】${$.jsRed}元(原极速版) \n`;
						}
							
						if ($.jdRed > 0){
							if($.jdRedExpire>0)
								$.message += `【京东红包】${$.jdRed}(将过期${$.jdRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【京东红包】${$.jdRed}元 \n`;
						}
							
						if ($.jdhRed > 0){
							if($.jdhRedExpire>0)
								$.message += `【健康红包】${$.jdhRed}(将过期${$.jdhRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【健康红包】${$.jdhRed}元 \n`;
						}
							
						if ($.jdwxRed > 0){
							if($.jdwxRedExpire>0)
								$.message += `【微信小程序】${$.jdwxRed}(将过期${$.jdwxRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【微信小程序】${$.jdwxRed}元 \n`;
						}
							
						if ($.jdGeneralRed > 0){
							if($.jdGeneralRedExpire>0)
								$.message += `【全平台通用】${$.jdGeneralRed}(将过期${$.jdGeneralRedExpire.toFixed(2)})元 \n`;
							else
								$.message += `【全平台通用】${$.jdGeneralRed}元 \n`;
							
						}
							
					} else {
						console.log(`京东服务器返回空数据`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}
function jdfruitRequest(function_id, body = {}, timeout = 1000) {
	return new Promise(resolve => {
		setTimeout(() => {
			$.get(taskfruitUrl(function_id, body), (err, resp, data) => {
				try {
					if (err) {
						console.log('\n东东农场: API查询请求失败 ‼️‼️')
						console.log(JSON.stringify(err));
						console.log(`function_id:${function_id}`)
						$.logErr(err);
					} else {
						if (safeGet(data)) {							
							data = JSON.parse(data);
							if (data.code=="400"){
								console.log('东东农场: '+data.message);
								llgeterror = true;
							}
							else
								$.JDwaterEveryDayT = data.totalWaterTaskInit.totalWaterTaskTimes;
						}
					}
				} catch (e) {
					$.logErr(e, resp);
				}
				finally {
					resolve(data);
				}
			})
		}, timeout)
	})
}

async function getjdfruitinfo() {
    if (EnableJdFruit) {
        llgeterror = false;

        await jdfruitRequest('taskInitForFarm', {
            "version": 14,
            "channel": 1,
            "babelChannel": "120"
        });
		
		if (llgeterror)
			return
		
        await getjdfruit();
        if (llgeterror) {
            console.log(`东东农场API查询失败,等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await getjdfruit();
        }
        if (llgeterror) {
            console.log(`东东农场API查询失败,有空重启路由器换个IP吧.`)
        }

    }
	return;
}

async function getjdfruit() {
	return new Promise(resolve => {
		const option = {
			url: `${JD_API_HOST}?functionId=initForFarm`,
			body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
			headers: {
				"accept": "*/*",
				"accept-encoding": "gzip, deflate, br",
				"accept-language": "zh-CN,zh;q=0.9",
				"cache-control": "no-cache",
				"cookie": cookie,
				"origin": "https://home.m.jd.com",
				"pragma": "no-cache",
				"referer": "https://home.m.jd.com/myJd/newhome.action",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site",
				"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
				"Content-Type": "application/x-www-form-urlencoded"
			},
			timeout: 10000
		};
		$.post(option, (err, resp, data) => {
			try {
				if (err) {
					if(!llgeterror){
						console.log('\n东东农场: API查询请求失败 ‼️‼️');
						console.log(JSON.stringify(err));
					}
					llgeterror = true;
				} else {
					llgeterror = false;
					if (safeGet(data)) {
						$.farmInfo = JSON.parse(data)
							if ($.farmInfo.farmUserPro) {
								$.JdFarmProdName = $.farmInfo.farmUserPro.name;
								$.JdtreeEnergy = $.farmInfo.farmUserPro.treeEnergy;
								$.JdtreeTotalEnergy = $.farmInfo.farmUserPro.treeTotalEnergy;
								$.treeState = $.farmInfo.treeState;
								let waterEveryDayT = $.JDwaterEveryDayT;
								let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10; //一共还需浇多少次水
								let waterD = Math.ceil(waterTotalT / waterEveryDayT);

								$.JdwaterTotalT = waterTotalT;
								$.JdwaterD = waterD;
							}
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve();
			}
		})
	})
}

function taskfruitUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "*/*",
      "Origin": "https://carry.m.jd.com",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Referer": "https://carry.m.jd.com/",
      "Cookie": cookie
    },
    timeout: 10000
  }
}

function safeGet(data) {
	try {
		if (typeof JSON.parse(data) == "object") {
			return true;
		}
	} catch (e) {
		console.log(e);
		console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
		return false;
	}
}

function cash() {
	if (!EnableJdSpeed)
		return;
	return new Promise(resolve => {
		$.get(taskcashUrl('MyAssetsService.execute', {
				"method": "userCashRecord",
				"data": {
					"channel": 1,
					"pageNum": 1,
					"pageSize": 20
				}
			}),
			async(err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(`cash API请求失败，请检查网路重试`)
				} else {
					if (safeGet(data)) {
						data = JSON.parse(data);
						if (data.data.goldBalance)
							$.JDtotalcash = data.data.goldBalance;
						else
							console.log(`领现金查询失败，服务器没有返回具体值.`)
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			}
			finally {
				resolve(data);
			}
		})
	})
}

function taskcashUrl(functionId, body = {}) {
	const struuid = randomString(16);
	let nowTime = Date.now();
	let _0x7683x5 = `${"lite-android&"}${JSON["stringify"](body)}${"&android&3.1.0&"}${functionId}&${nowTime}&${struuid}`;
	let _0x7683x6 = "12aea658f76e453faf803d15c40a72e0";
	const _0x7683x7 = $["isNode"]() ? require("crypto-js") : CryptoJS;
	let sign = _0x7683x7.HmacSHA256(_0x7683x5, _0x7683x6).toString();
	let strurl=JD_API_HOST+"api?functionId="+functionId+"&body="+`${escape(JSON["stringify"](body))}&appid=lite-android&client=android&uuid=`+struuid+`&clientVersion=3.1.0&t=${nowTime}&sign=${sign}`;
	return {
		url: strurl,
		headers: {
			'Host': "api.m.jd.com",
			'accept': "*/*",
			'kernelplatform': "RN",
			'user-agent': "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)",
			'accept-language': "zh-Hans-CN;q=1, ja-CN;q=0.9",
			'Cookie': cookie
		},
		timeout: 10000
	}
}
	
function randomString(e) {
	e = e || 32;
	let t = "0123456789abcdef",
	a = t.length,
	n = "";
	for (let i = 0; i < e; i++)
		n += t.charAt(Math.floor(Math.random() * a));
	return n
}

Date.prototype.Format = function (fmt) {
	var e,
	n = this,
	d = fmt,
	l = {
		"M+": n.getMonth() + 1,
		"d+": n.getDate(),
		"D+": n.getDate(),
		"h+": n.getHours(),
		"H+": n.getHours(),
		"m+": n.getMinutes(),
		"s+": n.getSeconds(),
		"w+": n.getDay(),
		"q+": Math.floor((n.getMonth() + 3) / 3),
		"S+": n.getMilliseconds()
	};
	/(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
	for (var k in l) {
		if (new RegExp("(".concat(k, ")")).test(d)) {
			var t,
			a = "S+" === k ? "000" : "00";
			d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
		}
	}
	return d;
}

function jsonParse(str) {
	if (typeof str == "string") {
		try {
			return JSON.parse(str);
		} catch (e) {
			console.log(e);
			$.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
			return [];
		}
	}
}
function timeFormat(time) {
	let date;
	if (time) {
		date = new Date(time)
	} else {
		date = new Date();
	}
	return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}


function GetDateTime(date) {

	var timeString = "";

	var timeString = date.getFullYear() + "-";
	if ((date.getMonth() + 1) < 10)
		timeString += "0" + (date.getMonth() + 1) + "-";
	else
		timeString += (date.getMonth() + 1) + "-";

	if ((date.getDate()) < 10)
		timeString += "0" + date.getDate() + " ";
	else
		timeString += date.getDate() + " ";

	if ((date.getHours()) < 10)
		timeString += "0" + date.getHours() + ":";
	else
		timeString += date.getHours() + ":";

	if ((date.getMinutes()) < 10)
		timeString += "0" + date.getMinutes() + ":";
	else
		timeString += date.getMinutes() + ":";

	if ((date.getSeconds()) < 10)
		timeString += "0" + date.getSeconds();
	else
		timeString += date.getSeconds();

	return timeString;
}

async function getuserinfo() {
	var body=[{"pin": "$cooMrdGatewayUid$"}];
	var ua = `jdapp;iPhone;${random(["11.1.0", "10.5.0", "10.3.6"])};${random(["13.5", "14.0", "15.0"])};${uuidRandom()};network/wifi;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,6;addressid/7565095847;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`;

    let config = {
        url: 'https://lop-proxy.jd.com/JingIntegralApi/userAccount',
        body: JSON.stringify(body),
        headers: {
            "host": "lop-proxy.jd.com",
            "jexpress-report-time": Date.now().toString(),
            "access": "H5",
            "source-client": "2",
            "accept": "application/json, text/plain, */*",
            "d_model": "iPhone11,6",
            "accept-encoding": "gzip",
            "lop-dn": "jingcai.jd.com",
            "user-agent": ua,
            "partner": "",
            "screen": "375*812",
            "cookie": cookie,
            "x-requested-with": "XMLHttpRequest",
            "version": "1.0.0",
            "uuid": randomNumber(10),
            "clientinfo": "{\"appName\":\"jingcai\",\"client\":\"m\"}",
            "d_brand": "iPhone",
            "appparams": "{\"appid\":158,\"ticket_type\":\"m\"}",
            "sdkversion": "1.0.7",
            "area": area(),
            "client": "iOS",
            "referer": "https://jingcai-h5.jd.com/",
            "eid": "",
            "osversion": random(["13.5", "14.0", "15.0"]),
            "networktype": "wifi",
            "jexpress-trace-id": uuid(),
            "origin": "https://jingcai-h5.jd.com",
            "app-key": "jexpress",
            "event-id": uuid(),
            "clientversion": random(["11.1.0", "10.5.0", "10.3.6"]),
            "content-type": "application/json;charset=utf-8",
            "build": "167541",
            "biz-type": "service-monitor",
            "forcebot": "0"
        }
    }
    return new Promise(resolve => {
        $.post(config, async(err, resp, data) => {
            try {
                //console.log(data)
                if (err) {
                    console.log(err)
                } else {					
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data || '');
            }
        })
    })
}
function area() {
    let i = getRand(1, 30)
        let o = getRand(70, 3000)
        let x = getRand(900, 60000)
        let g = getRand(600, 30000)
        let a = i + '_' + o + '_' + x + '_' + g;
    return a
};
function getRand(min, max) {
    return parseInt(Math.random() * (max - min)) + min;
};
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
};
function uuidRandom() {
    return Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10) +
    Math.random().toString(16).slice(2, 10);
}
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumber(len) {
    let chars = '0123456789';
    let maxPos = chars.length;
    let str = '';
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return Date.now() + str;
}
// prettier-ignore
function Env(t, e) {
	"undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
	class s {
		constructor(t) {
			this.env = t
		}
		send(t, e = "GET") {
			t = "string" == typeof t ? {
				url: t
			}
			 : t;
			let s = this.get;
			return "POST" === e && (s = this.post),
			new Promise((e, i) => {
				s.call(this, t, (t, s, r) => {
					t ? i(t) : e(s)
				})
			})
		}
		get(t) {
			return this.send.call(this.env, t)
		}
		post(t) {
			return this.send.call(this.env, t, "POST")
		}
	}
	return new class {
		constructor(t, e) {
			this.name = t,
			this.http = new s(this),
			this.data = null,
			this.dataFile = "box.dat",
			this.logs = [],
			this.isMute = !1,
			this.isNeedRewrite = !1,
			this.logSeparator = "\n",
			this.startTime = (new Date).getTime(),
			Object.assign(this, e),
			this.log("", `🔔${this.name}, 开始!`)
		}
		isNode() {
			return "undefined" != typeof module && !!module.exports
		}
		isQuanX() {
			return "undefined" != typeof $task
		}
		isSurge() {
			return "undefined" != typeof $httpClient && "undefined" == typeof $loon
		}
		isLoon() {
			return "undefined" != typeof $loon
		}
		toObj(t, e = null) {
			try {
				return JSON.parse(t)
			} catch {
				return e
			}
		}
		toStr(t, e = null) {
			try {
				return JSON.stringify(t)
			} catch {
				return e
			}
		}
		getjson(t, e) {
			let s = e;
			const i = this.getdata(t);
			if (i)
				try {
					s = JSON.parse(this.getdata(t))
				} catch {}
			return s
		}
		setjson(t, e) {
			try {
				return this.setdata(JSON.stringify(t), e)
			} catch {
				return !1
			}
		}
		getScript(t) {
			return new Promise(e => {
				this.get({
					url: t
				}, (t, s, i) => e(i))
			})
		}
		runScript(t, e) {
			return new Promise(s => {
				let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
				i = i ? i.replace(/\n/g, "").trim() : i;
				let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
				r = r ? 1 * r : 20,
				r = e && e.timeout ? e.timeout : r;
				const[o, h] = i.split("@"),
				n = {
					url: `http://${h}/v1/scripting/evaluate`,
					body: {
						script_text: t,
						mock_type: "cron",
						timeout: r
					},
					headers: {
						"X-Key": o,
						Accept: "*/*"
					}
				};
				this.post(n, (t, e, i) => s(i))
			}).catch(t => this.logErr(t))
		}
		loaddata() {
			if (!this.isNode())
				return {}; {
				this.fs = this.fs ? this.fs : require("fs"),
				this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
				e = this.path.resolve(process.cwd(), this.dataFile),
				s = this.fs.existsSync(t),
				i = !s && this.fs.existsSync(e);
				if (!s && !i)
					return {}; {
					const i = s ? t : e;
					try {
						return JSON.parse(this.fs.readFileSync(i))
					} catch (t) {
						return {}
					}
				}
			}
		}
		writedata() {
			if (this.isNode()) {
				this.fs = this.fs ? this.fs : require("fs"),
				this.path = this.path ? this.path : require("path");
				const t = this.path.resolve(this.dataFile),
				e = this.path.resolve(process.cwd(), this.dataFile),
				s = this.fs.existsSync(t),
				i = !s && this.fs.existsSync(e),
				r = JSON.stringify(this.data);
				s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
			}
		}
		lodash_get(t, e, s) {
			const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
			let r = t;
			for (const t of i)
				if (r = Object(r)[t], void 0 === r)
					return s;
			return r
		}
		lodash_set(t, e, s) {
			return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
		}
		getdata(t) {
			let e = this.getval(t);
			if (/^@/.test(t)) {
				const[, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
				r = s ? this.getval(s) : "";
				if (r)
					try {
						const t = JSON.parse(r);
						e = t ? this.lodash_get(t, i, "") : e
					} catch (t) {
						e = ""
					}
			}
			return e
		}
		setdata(t, e) {
			let s = !1;
			if (/^@/.test(e)) {
				const[, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
				o = this.getval(i),
				h = i ? "null" === o ? null : o || "{}" : "{}";
				try {
					const e = JSON.parse(h);
					this.lodash_set(e, r, t),
					s = this.setval(JSON.stringify(e), i)
				} catch (e) {
					const o = {};
					this.lodash_set(o, r, t),
					s = this.setval(JSON.stringify(o), i)
				}
			} else
				s = this.setval(t, e);
			return s
		}
		getval(t) {
			return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
		}
		setval(t, e) {
			return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
		}
		initGotEnv(t) {
			this.got = this.got ? this.got : require("got"),
			this.cktough = this.cktough ? this.cktough : require("tough-cookie"),
			this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar,
			t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
		}
		get(t, e = (() => {})) {
			t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
			this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
						"X-Surge-Skip-Scripting": !1
					})), $httpClient.get(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status),
					e(t, s, i)
				})) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
						hints: !1
					})), $task.fetch(t).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
					try {
						if (t.headers["set-cookie"]) {
							const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
							s && this.ckjar.setCookieSync(s, null),
							e.cookieJar = this.ckjar
						}
					} catch (t) {
						this.logErr(t)
					}
				}).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => {
					const {
						message: s,
						response: i
					} = t;
					e(s, i, i && i.body)
				}))
		}
		post(t, e = (() => {})) {
			if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon())
				this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
						"X-Surge-Skip-Scripting": !1
					})), $httpClient.post(t, (t, s, i) => {
					!t && s && (s.body = i, s.statusCode = s.status),
					e(t, s, i)
				});
			else if (this.isQuanX())
				t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
						hints: !1
					})), $task.fetch(t).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => e(t));
			else if (this.isNode()) {
				this.initGotEnv(t);
				const {
					url: s,
					...i
				} = t;
				this.got.post(s, i).then(t => {
					const {
						statusCode: s,
						statusCode: i,
						headers: r,
						body: o
					} = t;
					e(null, {
						status: s,
						statusCode: i,
						headers: r,
						body: o
					}, o)
				}, t => {
					const {
						message: s,
						response: i
					} = t;
					e(s, i, i && i.body)
				})
			}
		}
		time(t, e = null) {
			const s = e ? new Date(e) : new Date;
			let i = {
				"M+": s.getMonth() + 1,
				"d+": s.getDate(),
				"H+": s.getHours(),
				"m+": s.getMinutes(),
				"s+": s.getSeconds(),
				"q+": Math.floor((s.getMonth() + 3) / 3),
				S: s.getMilliseconds()
			};
			/(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
			for (let e in i)
				new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
			return t
		}
		msg(e = t, s = "", i = "", r) {
			const o = t => {
				if (!t)
					return t;
				if ("string" == typeof t)
					return this.isLoon() ? t : this.isQuanX() ? {
						"open-url": t
					}
				 : this.isSurge() ? {
					url: t
				}
				 : void 0;
				if ("object" == typeof t) {
					if (this.isLoon()) {
						let e = t.openUrl || t.url || t["open-url"],
						s = t.mediaUrl || t["media-url"];
						return {
							openUrl: e,
							mediaUrl: s
						}
					}
					if (this.isQuanX()) {
						let e = t["open-url"] || t.url || t.openUrl,
						s = t["media-url"] || t.mediaUrl;
						return {
							"open-url": e,
							"media-url": s
						}
					}
					if (this.isSurge()) {
						let e = t.url || t.openUrl || t["open-url"];
						return {
							url: e
						}
					}
				}
			};
			if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
				let t = ["", "==============📣系统通知📣=============="];
				t.push(e),
				s && t.push(s),
				i && t.push(i),
				console.log(t.join("\n")),
				this.logs = this.logs.concat(t)
			}
		}
		log(...t) {
			t.length > 0 && (this.logs = [...this.logs, ...t]),
			console.log(t.join(this.logSeparator))
		}
		logErr(t, e) {
			const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
			s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
		}
		wait(t) {
			return new Promise(e => setTimeout(e, t))
		}
		done(t = {}) {
			const e = (new Date).getTime(),
			s = (e - this.startTime) / 1e3;
			this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
			this.log(),
			(this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
		}
	}
	(t, e)
}
