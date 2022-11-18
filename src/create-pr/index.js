const core = require("@actions/core");
const github = require("@actions/github");

const GH_ACTION_PLAYGROUND_BOT_NAME = "github-actions[bot]";
const GH_ACTION_PLAYGROUND_COMMENT_KEY = "GH_ACTION_PLAYGROUND_KEY";
const GH_ACTION_PLAYGROUND_COMMENT_HEADER = `<!--- ${GH_ACTION_PLAYGROUND_COMMENT_KEY} -->`;

async function run() {
  try {
    const github_token = core.getInput("repo_token");

    console.log(github.context);

    const octokit = github.getOctokit(github_token);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
