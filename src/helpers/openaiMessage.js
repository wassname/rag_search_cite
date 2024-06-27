
import OpenAI from 'openai';

function configureOpenAI() {
  return new OpenAI({
    apiKey: localStorage.getItem('OPENAI_KEY'),
    baseURL: localStorage.getItem('OPENAI_BASE_URL'),
    dangerouslyAllowBrowser: true,
  });
}


// /** send to openai */
// function sendOpenAIMessage(model, messages, callback, onStatus) {
//   let openai = configureOpenAI()
//   console.debug("sending", messages);
//   if (!onStatus) { onStatus = () => {}; }
//   onStatus({ status: "Loading" })
//   // https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts#L796C3-L796C14
//   const chatCompletion = openai.chat.completions.create({
//     messages: messages,
//     model: model,
//     temperature: parseFloat(localStorage.getItem('OPENAI_TEMP', 1)),
//   });
//   chatCompletion.then((m) => {
//     console.debug(m)
//     callback(m['choices'][0]['message']['content'])
//     onStatus({})
//   }).catch(async (err) => {
//     if (err instanceof OpenAI.APIError) {
//       console.log(err.status); // 400
//       console.log(err.name); // BadRequestError
//       console.log(err.headers); // {server: 'nginx', ...}
//       if (onStatus) { onStatus({ error: `${err.status}: ${err.message}` }) }
//     } else {
//       onStatus({ error: JSON.stringify(err) })
//       throw err;
//     }
//   });

// }

function sendOpenAIMessage(model, messages, onStatus) {
  return new Promise((resolve, reject) => {
    let openai = configureOpenAI();
    console.debug("sending", messages);
    if (!onStatus) { onStatus = () => {}; }
    onStatus({ status: "Loading" });
    const chatCompletion = openai.chat.completions.create({
      messages: messages,
      model: model,
      temperature: parseFloat(localStorage.getItem('OPENAI_TEMP') || '1'),
    });
    chatCompletion.then((m) => {
      console.debug(m);
      resolve(m['choices'][0]['message']['content']);
      onStatus({});
    }).catch((err) => {
      if (err instanceof OpenAI.APIError) {
        console.log(err.status); // 400
        console.log(err.name); // BadRequestError
        console.log(err.headers); // {server: 'nginx', ...}
        if (onStatus) { onStatus({ error: `${err.status}: ${err.message}` }) }
      } else {
        onStatus({ error: JSON.stringify(err) });
      }
      reject(err);
    });
  });
}

export default sendOpenAIMessage
