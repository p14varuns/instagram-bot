const puppeteer = require('puppeteer');

const username = process.argv[2];
const password = process.argv[3];

if(!username | !password){
  console.error("Missing Login Credentials");
  return;
}

const url = "https://www.instagram.com/";
tag = "painting";
const tagURL = "https://www.instagram.com/explore/tags/" + tag;

async function run () {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle2'});
  /*
  // Login using Manual userid and password
  await page.focus('.HmktE > div:nth-child(2) > div > label > input')
  await page.keyboard.type(username);
  await page.focus('.HmktE > div:nth-child(3) > div > label > input')
  await page.keyboard.type(password);
  await page.click('.HmktE > div:nth-child(4) > button')
  */

  // Login using Facebook
  await page.tap(".sqdOP.yWX7d.y3zKF");
  await page.waitFor(5000);
  await page.focus('div#loginform > div > input');
  await page.keyboard.type(username);

  await page.focus('input#pass');
  await page.keyboard.type(password);
  await page.click('button#loginbutton')
  await page.waitFor(10000);

  //Dismiss notifications Pop up
  //await page.click('button.aOOlW.HoLwm');
  //await page.waitFor(10000);

  const tagPage = await browser.newPage();
  await tagPage.goto(tagURL, {waitUntil: 'networkidle2'});
  await tagPage.waitFor(10000);
  await tagPage.tap(".v1Nh3.kIKUG._bz0w");

  for (var i = 0; i < 100; i++) {
    try {
      await tagPage.waitFor(5000);
      await reviewPostandAction(tagPage);
      await tagPage.waitFor(5000);
      console.log("clicking next now");
      await tagPage.tap("a._65Bje.coreSpriteRightPaginationArrow");
      await tagPage.waitFor(10000);
    }  catch (err) {
     console.error(err);
     throw new Error('page.goto/waitForSelector timed out.');
   }
  }

  await tagPage.screenshot({path: 'screenshot.png'});
  browser.close();
};


reviewPostandAction = async (tagPage) => {
  try{
  const element = await tagPage.$("button.sqdOP.yWX7d._8A5w5 > span");
  const text = await tagPage.evaluate(element => element.textContent, element);
  var likes = Number(text.replace(",",""));
  if(likes > 500){
    const likeElement = await tagPage.$("span.fr66n > button > svg");
    const likeStatus = await tagPage.evaluate(likeElement => likeElement.getAttribute("aria-label"), likeElement);
    console.log(likeStatus);
    if(likeStatus == "Like"){
      console.log("Like this Post");
      await tagPage.waitFor(5000);
      await tagPage.tap("span.fr66n > button");

    } else if(likeStatus == "Unlike"){
      console.log("Already liked. Move to next Post");  
    } else{
      console.log("This shouldn't happen ideally " + likeStatus);
    }
  } else{
    console.log("Move to next post");
  }
} catch(err){
  console.error(err);
}
};

run();