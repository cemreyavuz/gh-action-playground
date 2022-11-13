const core = require("@actions/core");
const github = require("@actions/github");

const GH_ACTION_PLAYGROUND_BOT_NAME = "github-actions[bot]";
const GH_ACTION_PLAYGROUND_COMMENT_KEY = "GH_ACTION_PLAYGROUND_KEY";
const GH_ACTION_PLAYGROUND_COMMENT_HEADER = `<!--- ${GH_ACTION_PLAYGROUND_COMMENT_KEY} -->`;

async function run() {
  try {
    const github_token = core.getInput("repo_token");
    const octokit = github.getOctokit(github_token);

    const comments = await octokit.rest.issues
      .listComments({
        owner: github.context.issue.owner,
        repo: github.context.issue.repo,
        issue_number: github.context.issue.number,
      })
      .then((response) => response.data);

    await Promise.all(
      comments
        .filter(
          ({ body, user }) =>
            user.login === GH_ACTION_PLAYGROUND_BOT_NAME &&
            body.includes(GH_ACTION_PLAYGROUND_COMMENT_KEY)
        )
        .map(({ id }) => {
          return octokit.rest.issues.deleteComment({
            comment_id: id,
            owner: github.context.issue.owner,
            repo: github.context.issue.repo,
          });
        })
    );

    const commentBody = `
${GH_ACTION_PLAYGROUND_COMMENT_HEADER}
I can comment on PRs! (But I also can delete previous comments by me)
    `;

    await octokit.rest.issues.createComment({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      issue_number: github.context.issue.number,
      body: commentBody,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
