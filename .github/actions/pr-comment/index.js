const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const github_token = core.getInput('GITHUB_TOKEN');
    const pr_number = core.getInput('pr_number');
    
    const octokit = github.getOctokit(github_token);

    const { data: pullRequest } = await octokit.rest.pulls.get({
      repo: 'cemreyavuz/gh-action-playground',
      pull_number: pr_number,
  });

  console.log(pullRequest);
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
