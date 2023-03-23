/*
还不够完善，有问题反馈
export TB_USERNAME="账号"
export TB_PASSWORD="密码"
需要安装puppeteer依赖
from unique
依赖安装遇到问题请进群:790665041
*/
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone X'];

const account = process.env.TB_USERNAME; // 从环境变量中获取淘宝用户名
const password = process.env.TB_PASSWORD; // 从环境变量中获取淘宝密码

(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']}); // 防止Puppeteer在沙盒模式中运行出现错误
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.goto('https://login.taobao.com/member/login.jhtml', {waitUntil: 'networkidle0'}); // 进入淘宝登录页面
  await page.type('#fm-login-id', account); // 输入用户名
  await page.type('#fm-login-password', password); // 输入密码
  await page.click('#btn-submit'); // 点击登录按钮
  await page.waitForNavigation({waitUntil: 'networkidle0'}); // 等待页面跳转
  await page.goto('https://h5.m.taobao.com/fav/index.htm', {waitUntil: 'networkidle0'}); // 进入我的淘宝页面
  await page.waitForSelector('.fav-bottom>.nav>.nav__item:nth-child(5)'); // 等待元宝领取入口加载完毕
  const button = await page.$('.fav-bottom>.nav>.nav__item:nth-child(5)');
  await button.tap(); // 点击元宝领取按钮
  await page.waitForNavigation({waitUntil: 'networkidle0'}); // 等待页面跳转
  await page.click('.withdraw-btn'); // 点击领取按钮
  await page.waitForSelector('.mobile-bind-empty .nb-content'); // 等待页面加载完毕（可能需要手动解决滑块验证码）
  const result = await page.evaluate(() => {
    return document.querySelector('.tip__success___3wCfP').textContent;
  });
  if (result === '恭喜获得1个优惠券') {
    console.log(`Successfully claimed 1 yuanbao for ${account} in browser.`);
  }
  await page.goBack(); // 返回我的淘宝页面
  await page.waitForSelector('.my-taobao__content___1Ae0Z .icon-button__icon___2jdWd'); // 等待页面加载完毕
  const checkinBtn = await page.$('.my-taobao__content___1Ae0Z .icon-button__icon___2jdWd');
  await checkinBtn.tap(); // 点击签到按钮
  const successToast = await page.$('.m-toast__content');
  if (successToast) {
    console.log(`Successfully signed in for ${account} in app.`);
  }
  await browser.close(); // 关闭浏览器
})();
