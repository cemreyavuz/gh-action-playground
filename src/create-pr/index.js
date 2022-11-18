const core = require("@actions/core");
const github = require("@actions/github");

const GH_ACTION_PLAYGROUND_BOT_NAME = "github-actions[bot]";
const GH_ACTION_PLAYGROUND_COMMENT_KEY = "GH_ACTION_PLAYGROUND_KEY";
const GH_ACTION_PLAYGROUND_COMMENT_HEADER = `<!--- ${GH_ACTION_PLAYGROUND_COMMENT_KEY} -->`;
const GH_ACTION_BRANCH_NAME = "create-pr-bot";
const GH_ACTION_REF_SHORT = `heads/${GH_ACTION_BRANCH_NAME}`;
const GH_ACTION_REF_LONG = `refs/${GH_ACTION_REF_SHORT}`;

async function run() {
  try {
    const github_token = core.getInput("repo_token");

    const repository = github.context.payload.repository;
    const owner = repository.owner;
    const repositoryName = repository.name;
    const ownerName = owner.name;

    const octokit = github.getOctokit(github_token);

    /* octokit.rest.git.createRef({
      owner: ownerName,
      repo: repositoryName,
      ref,
      sha,
    }); */

    const branch = await octokit.rest.repos
      .getBranch({
        owner: ownerName,
        repo: repositoryName,
        branch: "main",
      })
      .then((res) => res.data);

    const headCommit = branch.commit;
    const headSHA = headCommit.sha;
    console.log(`Head SHA: ${headSHA}`);

    const files = [{ name: "test.md", contents: "Hello, buddy!" }];

    const committableFiles = files.map(({ name, contents }) => {
      return {
        path: name,
        mode: "100644",
        type: "commit",
        content: contents,
      };
    });

    const { data: tree } = await octokit.rest.git.createTree({
      owner: ownerName,
      repo: repositoryName,
      tree: committableFiles,
      base_tree: headSHA,
      message: "chore: add test.md to the tree using octokit",
      parents: [headSHA],
    });
    const treeSHA = tree.sha;

    const { data: commit } = await octokit.rest.git.createCommit({
      owner: ownerName,
      repo: repositoryName,
      tree: treeSHA,
      message: "chore: add test.md using octokit",
      parents: [headSHA],
    });
    const commitSHA = commit.sha;

    let existingRef;
    try {
      console.log(`Trying to get ref: ${GH_ACTION_REF_LONG}`);
      const { data } = await octokit.rest.git.getRef({
        owner: ownerName,
        repo: repositoryName,
        ref: GH_ACTION_REF_SHORT,
      });
      existingRef = data;
    } catch {}

    if (existingRef) {
      console.log(`Ref exists: ${GH_ACTION_REF_LONG}`);
      await octokit.rest.git.updateRef({
        owner: ownerName,
        repo: repositoryName,
        ref: GH_ACTION_REF_SHORT,
        sha: commitSHA,
        force: true,
      });
      console.log(`Updated ref: ${GH_ACTION_REF_LONG}`);
    } else {
      console.log(`Ref doesn't exist: ${GH_ACTION_REF_LONG}`);
      await octokit.rest.git.createRef({
        owner: ownerName,
        repo: repositoryName,
        ref: GH_ACTION_REF_LONG,
        sha: commitSHA,
      });
      console.log(`Created ref: ${GH_ACTION_REF_LONG}`);
    }

    const prBody = `
${GH_ACTION_PLAYGROUND_COMMENT_HEADER}
I can create PRs!
    `;

    const { data: prs } = await octokit.rest.pulls.list({
      owner: ownerName,
      repo: repositoryName,
    });

    const hasOpenPR = prs.some(
      ({ body, head }) =>
        body.includes(GH_ACTION_PLAYGROUND_COMMENT_KEY) &&
        head.ref === GH_ACTION_BRANCH_NAME
    );

    if (hasOpenPR) {
      console.log("Has open PR! Exiting..");
    } else {
      await octokit.rest.pulls.create({
        owner: ownerName,
        repo: repositoryName,
        title: "Have i just created a PR?",
        head: GH_ACTION_BRANCH_NAME,
        base: "main",
        body: prBody,
      });
      console.log("Created a PR! Exiting..");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
