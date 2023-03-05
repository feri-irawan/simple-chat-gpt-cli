#!/usr/bin/env node

const dotenv = require("dotenv");
const { log } = require("console");
const { Configuration, OpenAIApi } = require("openai");
const chalk = require("chalk");
const yargs = require("yargs");
const yargsInteractive = require("yargs-interactive");

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let text = "";

async function ask(question) {
  text += `Q:${question}\nA:`;
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: text,
      max_tokens: 200,
    });

    const { choices } = response.data;
    const reply = choices.map(({ text }) => text).join("\n");

    text += reply + "\n";

    log(chalk.blue("~ ") + chalk.bold("Reply:") + reply + "\n");

    questionInput();
  } catch (err) {
    log(err);
  }
}

function questionInput() {
  yargsInteractive()
    .interactive({
      interactive: {
        default: true,
      },
      question: {
        type: "input",
        describe: "Question:",
      },
    })
    .then(({ question }) => {
      ask(question);
    });
}

yargs
  .usage("ask")
  .command("ask", "Asking to Chat GPT", {}, async () => {
    questionInput();
  })
  .demandCommand(1).argv;
