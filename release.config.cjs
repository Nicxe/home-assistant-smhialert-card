const config = require("@nicxe/semantic-release-config")({
  kind: "assets",
  projectName: "SMHI Alert Card",
  repoSlug: "Nicxe/home-assistant-smhialert-card",
  assets: [
    {
      path: "smhi-alert-card.js",
      label: "smhi-alert-card.js"
    },
    {
      path: "icons/*.svg",
      name: "{{base}}"
    }
  ]
}
);

const githubPlugin = config.plugins.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === "@semantic-release/github"
);

if (githubPlugin?.[1]) {
  githubPlugin[1].successCommentCondition = false;
}

module.exports = config;
