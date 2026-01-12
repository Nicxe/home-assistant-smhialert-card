module.exports = require("@nicxe/semantic-release-config")({
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
});

