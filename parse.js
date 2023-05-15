const fs = require("fs");
const path = require("path");

const file = fs.readFileSync(path.join(__dirname, "data.json"), "utf8");
const data = JSON.parse(file);

const counts = {};

data.forEach((a) => {
  a.forEach((b) => {
    b.forEach((c) => {
      const obs_id = c["observation_id"];
      if (obs_id in counts) {
        counts[obs_id] += 1;
      } else {
        counts[obs_id] = 1;
      }
    });
  });
});

console.log(counts);
