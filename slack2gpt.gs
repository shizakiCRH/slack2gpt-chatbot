const prop = PropertiesService.getScriptProperties().getProperties();
const lock = LockService.getScriptLock();

function doPost(e) {

  let app = SlackApp.create(prop.SLACK_BOT_TOKEN);
  let message = e.parameter.text;
  let userID = e.parameter.user_id;

  if (userID === prop.BOT_ID) return;

  lock.tryLock(10000);
  
  const apiKey = prop.OPEN_AI_KEY;
  const url = "https://api.openai.com/v1/chat/completions";

  const payload = {
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": message}]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Bearer " + apiKey
    },
    "payload": JSON.stringify(payload)
  };

  const response = UrlFetchApp.fetch(url, options);
  const content = JSON.parse(response);

  // contentオブジェクトにAPIから返された情報が含まれる
  const message2 = content.choices[0].message.content;

  app.postMessage("grp_chatgpt_bot", message2, {
    thread_ts: e.parameter.timestamp
  });

  lock.releaseLock();

}

