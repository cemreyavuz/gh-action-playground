const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const github_token = core.getInput("repo_token");
    const octokit = github.getOctokit(github_token);

    await octokit.rest.issues.createComment({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      issue_number: github.context.issue.number,
      body: "I can comment on PRs!",
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
