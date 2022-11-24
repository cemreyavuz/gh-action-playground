const core = require("@actions/core");
const github = require("@actions/github");

const GH_ACTION_PLAYGROUND_BOT_NAME = "github-actions[bot]";
const GH_ACTION_PLAYGROUND_COMMENT_KEY = "GH_ACTION_PLAYGROUND_KEY";
const GH_ACTION_PLAYGROUND_COMMENT_HEADER = `<!--- ${GH_ACTION_PLAYGROUND_COMMENT_KEY} -->`;

const FILE_NAME = "test.json";

async function run() {
  try {
    const github_token = core.getInput("repo_token");
    const octokit = github.getOctokit(github_token);

    const { data: commits } = await octokit.rest.pulls.listCommits({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      pull_number: github.context.issue.number,
    });
    
    const parentSHA = commits[0].parents[0].sha;
    const lastCommit = commits[commits.length - 1];

    const { data: file } = await octokit.rest.repos.getContent({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      path: FILE_NAME, // FIXME: use original file name
      ref: lastCommit.sha,
    });

    const content = file.content;
    const b = new Buffer(content, 'base64')
    const decoded = b.toString();

    console.log(decoded);

    const { data: file2 } = await octokit.rest.repos.getContent({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      path: FILE_NAME, // FIXME: use original file name
      ref: parentSHA,
    });

    const content2 = file2.content;
    const b2 = new Buffer(content2, 'base64')
    const decoded2 = b2.toString();

    console.log(decoded2);

    const files = await octokit.rest.pulls.listFiles({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      pull_number: github.context.issue.number,
    }).then((res) => res.data);

    console.log(files.map(({ filename }) => filename));

    /* files.forEach(({ patch }) => {
      const lines = patch.split('\n');
      console.log(lines);

      const filtered = lines.filter(
        (line) => line.startsWith("+") || line.startsWith("-")
      );
      console.log(filtered);
    }); */

    /* const comments = await octokit.rest.issues
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
    }); */
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
